import { Router } from "express";
import { db } from "../db/index.js";
import { aiUsage, aiSuggestions } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middleware/auth.js";
import { checkPlanMiddleware } from "../middleware/plan.js";
import { sendEmail, emailTemplates } from "../lib/email.js";
import { subscriptions, plans } from "../db/schema.js";
import { and } from "drizzle-orm";

export const aiRouter = Router();

// Simple AI response generator (mock - replace with OpenAI integration)
function generateAIResponse(message: string): string {
  const responses: Record<string, string> = {
    default: "¡Hola! Soy el asistente AgroSmart. Puedo ayudarte con consejos sobre agricultura urbana, compostaje, hidroponía y más. ¿Qué te gustaría saber?",
    riego: "Para un riego eficiente en huertos urbanos, te recomiendo usar riego por goteo. Ahorra hasta un 60% de agua comparado con el riego tradicional. Programa riegos temprano en la mañana o al atardecer para minimizar la evaporación.",
    compost: "Para hacer compost casero, necesitas una mezcla 3:1 de material 'marrón' (hojas secas, cartón) y 'verde' (restos de cocina, pasto). Mantén la humedad como una esponja exprimida y voltea cada 2-3 días. En 2-3 meses tendrás abono listo.",
    plagas: "Para control orgánico de plagas, prueba con aceite de neem diluido, jabón potásico o infusión de ajo. Plantas compañeras como la albahaca y la caléndula también ayudan a repeler insectos dañinos de forma natural.",
    hidroponia: "La hidroponía casera más sencilla es el sistema Kratky: un contenedor oscuro con tapa, agua con nutrientes y una canasta con la planta. Ideal para lechugas y hierbas. No necesita bombas ni electricidad.",
    semillas: "Para germinar semillas exitosamente: usa sustrato húmedo (no encharcado), mantén temperatura de 20-25°C, cubre con plástico hasta que broten, y expón gradualmente a la luz. La lechuga germina en 3-5 días, el tomate en 7-14 días.",
    sensor: "Los sensores IoT más útiles para tu huerto miden: humedad del suelo (capacitivo), temperatura ambiente, luz (PAR), y pH del agua. Con un ESP32 y estos sensores puedes automatizar el riego gastando menos de $20.",
  };

  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes("riego") || lowerMsg.includes("agua")) return responses.riego;
  if (lowerMsg.includes("compost") || lowerMsg.includes("abono")) return responses.compost;
  if (lowerMsg.includes("plaga") || lowerMsg.includes("insecto")) return responses.plagas;
  if (lowerMsg.includes("hidrop") || lowerMsg.includes("kratky")) return responses.hidroponia;
  if (lowerMsg.includes("semill") || lowerMsg.includes("germina")) return responses.semillas;
  if (lowerMsg.includes("sensor") || lowerMsg.includes("iot")) return responses.sensor;

  return responses.default;
}

function generateSuggestion(userId: number): string {
  const suggestions = [
    "📊 Según tus ventas recientes, los kits de huerta vertical tienen alta demanda. Considera aumentar tu stock en un 20%.",
    "🌱 Es temporada ideal para sembrar tomates cherry. Tus clientes han mostrado interés en variedades orgánicas.",
    "💡 Implementar un sistema de riego por goteo automatizado podría reducir tus costos de agua en un 40%.",
    "📈 Tu tasa de retención de clientes es del 85%. Ofrece un descuento del 10% a clientes recurrentes para alcanzar el 90%.",
    "🌿 La demanda de lechugas hidropónicas ha crecido un 30% este mes. Considera expandir tu capacidad de producción.",
    "♻️ Tu sistema de compostaje está procesando 142kg/mes. Optimizando la relación C/N podrías aumentar a 180kg/mes.",
  ];
  return suggestions[userId % suggestions.length];
}

// POST /api/ai/chat
aiRouter.post("/chat", authMiddleware, checkPlanMiddleware(["chatbot"]), async (req: AuthRequest, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ error: "Mensaje requerido" });
      return;
    }

    const response = generateAIResponse(message);

    if (db) {
      await db.insert(aiUsage).values({
        userId: req.user!.id,
        type: "chat",
        prompt: message,
        response,
        tokensUsed: Math.floor(Math.random() * 200) + 50,
      });
    }

    res.json({ response, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Error in AI chat:", error);
    res.status(500).json({ error: "Error en el chatbot" });
  }
});

// GET /api/ai/suggestions
aiRouter.get("/suggestions", authMiddleware, checkPlanMiddleware(["aiSuggestions"]), async (req: AuthRequest, res) => {
  try {
    const suggestion = generateSuggestion(req.user!.id);

    if (db) {
      await db.insert(aiSuggestions).values({
        userId: req.user!.id,
        suggestion,
      });

      await db.insert(aiUsage).values({
        userId: req.user!.id,
        type: "suggestion",
        prompt: "auto_suggestion",
        response: suggestion,
        tokensUsed: Math.floor(Math.random() * 100) + 30,
      });

      // If Impacto Global, also send by email
      const [sub] = await db
        .select({ slug: plans.slug })
        .from(subscriptions)
        .innerJoin(plans, eq(subscriptions.planId, plans.id))
        .where(
          and(
            eq(subscriptions.userId, req.user!.id),
            eq(subscriptions.status, "active")
          )
        );

      if (sub && sub.slug === "impacto_global") {
        await sendEmail(
          req.user!.email,
          "Tu sugerencia AgroSmart del día",
          emailTemplates.aiSuggestion(req.user!.name, suggestion)
        );

        // Update aiSuggestions record
        await db
          .update(aiSuggestions)
          .set({ sentByEmail: true, emailSentAt: new Date() })
          .where(eq(aiSuggestions.userId, req.user!.id));
      }
    }

    res.json({ suggestion, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Error generating suggestion:", error);
    res.status(500).json({ error: "Error al generar sugerencia" });
  }
});

// GET /api/ai/usage
aiRouter.get("/usage", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!db) {
      res.json({
        totalChats: 12,
        totalSuggestions: 5,
        totalTokens: 3200,
        recentUsage: [],
      });
      return;
    }

    const usage = await db
      .select()
      .from(aiUsage)
      .where(eq(aiUsage.userId, req.user!.id))
      .orderBy(desc(aiUsage.createdAt))
      .limit(20);

    const chats = usage.filter((u) => u.type === "chat").length;
    const suggestions = usage.filter((u) => u.type === "suggestion").length;
    const tokens = usage.reduce((s, u) => s + (u.tokensUsed || 0), 0);

    res.json({
      totalChats: chats,
      totalSuggestions: suggestions,
      totalTokens: tokens,
      recentUsage: usage,
    });
  } catch (error) {
    console.error("Error fetching AI usage:", error);
    res.json({ totalChats: 0, totalSuggestions: 0, totalTokens: 0, recentUsage: [] });
  }
});

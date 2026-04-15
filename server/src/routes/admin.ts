import { Router } from "express";
import { db } from "../db/index.js";
import { users, products, plans, subscriptions, sales, donations, aiUsage, services } from "../db/schema.js";
import { eq, desc, sql, count, sum } from "drizzle-orm";
import { authMiddleware, adminMiddleware, type AuthRequest } from "../middleware/auth.js";
import bcrypt from "bcryptjs";

export const adminRouter = Router();

// Apply auth + admin middleware to all routes
adminRouter.use(authMiddleware as any);
adminRouter.use(adminMiddleware as any);

// ============ STATS ============

adminRouter.get("/stats", async (_req, res) => {
  try {
    if (!db) {
      res.json({
        totalUsers: 156,
        totalRevenue: "2450.00",
        totalSales: 342,
        totalAiUsage: 1250,
        usersByPlan: [
          { plan: "Raíz Solidaria", count: 89 },
          { plan: "Desarrollo Rural", count: 45 },
          { plan: "Impacto Global", count: 22 },
        ],
        revenueByMonth: [
          { month: "Ene", revenue: 320 },
          { month: "Feb", revenue: 450 },
          { month: "Mar", revenue: 580 },
          { month: "Abr", revenue: 620 },
          { month: "May", revenue: 480 },
        ],
        revenueByPlan: [
          { plan: "Raíz Solidaria", revenue: 0 },
          { plan: "Desarrollo Rural", revenue: 980 },
          { plan: "Impacto Global", revenue: 1470 },
        ],
        salesByVendor: [
          { vendor: "AgroSmart", sales: 120, revenue: 1200 },
          { vendor: "EcoGreen", sales: 95, revenue: 850 },
          { vendor: "HuertoVivo", sales: 72, revenue: 640 },
          { vendor: "SemillasPuras", sales: 55, revenue: 420 },
        ],
        aiUsageByMonth: [
          { month: "Ene", chats: 180, suggestions: 45 },
          { month: "Feb", chats: 250, suggestions: 62 },
          { month: "Mar", chats: 310, suggestions: 78 },
          { month: "Abr", chats: 290, suggestions: 85 },
        ],
        platformGrowth: [
          { month: "Ene", users: 45, revenue: 320 },
          { month: "Feb", users: 78, revenue: 450 },
          { month: "Mar", users: 112, revenue: 580 },
          { month: "Abr", users: 156, revenue: 620 },
        ],
        servicesUsed: [
          { service: "Chatbot IA", usage: 450 },
          { service: "Marketplace", usage: 342 },
          { service: "Estadísticas", usage: 289 },
          { service: "Compostaje IoT", usage: 178 },
          { service: "Hidroponía", usage: 134 },
        ],
      });
      return;
    }

    const [userCount] = await db.select({ count: count() }).from(users);
    const [revenueResult] = await db.select({ total: sum(subscriptions.amountPaid) }).from(subscriptions);
    const [salesCount] = await db.select({ count: count() }).from(sales);
    const [aiCount] = await db.select({ count: count() }).from(aiUsage);

    res.json({
      totalUsers: userCount.count,
      totalRevenue: revenueResult.total || "0",
      totalSales: salesCount.count,
      totalAiUsage: aiCount.count,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

// ============ USERS CRUD ============

adminRouter.get("/users", async (_req, res) => {
  try {
    if (!db) {
      res.json({
        users: [
          { id: 1, name: "Admin User", email: "admin@agrosmart.eco", role: "admin", createdAt: new Date() },
          { id: 2, name: "Juan Pérez", email: "juan@email.com", role: "seller", createdAt: new Date() },
          { id: 3, name: "María García", email: "maria@email.com", role: "user", createdAt: new Date() },
          { id: 4, name: "Carlos Ruiz", email: "carlos@email.com", role: "user", createdAt: new Date() },
          { id: 5, name: "Ana López", email: "ana@email.com", role: "seller", createdAt: new Date() },
        ],
      });
      return;
    }
    const allUsers = await db.select({
      id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt));
    res.json({ users: allUsers });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error" });
  }
});

adminRouter.post("/users", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!db) {
      res.json({ user: { id: Date.now(), name, email, role }, message: "Usuario creado" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users).values({ name, email, password: hashedPassword, role }).returning();
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, message: "Usuario creado" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

adminRouter.put("/users/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email, role } = req.body;
    if (!db) {
      res.json({ user: { id, name, email, role }, message: "Usuario actualizado" });
      return;
    }
    const [user] = await db.update(users).set({ name, email, role, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    res.json({ user, message: "Usuario actualizado" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al actualizar" });
  }
});

adminRouter.delete("/users/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!db) { res.json({ message: "Usuario eliminado" }); return; }
    await db.delete(users).where(eq(users.id, id));
    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al eliminar" });
  }
});

// ============ PRODUCTS CRUD ============

adminRouter.get("/products", async (_req, res) => {
  try {
    if (!db) { res.json({ products: [] }); return; }
    const all = await db.select().from(products).orderBy(desc(products.createdAt));
    res.json({ products: all });
  } catch (error) { res.status(500).json({ error: "Error" }); }
});

adminRouter.delete("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!db) { res.json({ message: "Eliminado" }); return; }
    await db.delete(products).where(eq(products.id, id));
    res.json({ message: "Producto eliminado" });
  } catch (error) { res.status(500).json({ error: "Error" }); }
});

// ============ SERVICES CRUD ============

adminRouter.get("/services", async (_req, res) => {
  try {
    if (!db) {
      res.json({
        services: [
          { id: 1, name: "Chatbot IA", description: "Asistente inteligente de agricultura", category: "IA", isActive: true, usageCount: 450 },
          { id: 2, name: "Marketplace", description: "Compra y venta de productos", category: "Ventas", isActive: true, usageCount: 342 },
          { id: 3, name: "Monitoreo IoT", description: "Sensores en tiempo real", category: "IoT", isActive: true, usageCount: 289 },
          { id: 4, name: "Compostaje Smart", description: "Control inteligente de compostaje", category: "IoT", isActive: true, usageCount: 178 },
        ],
      });
      return;
    }
    const all = await db.select().from(services).orderBy(desc(services.createdAt));
    res.json({ services: all });
  } catch (error) { res.json({ services: [] }); }
});

adminRouter.post("/services", async (req, res) => {
  try {
    const { name, description, category } = req.body;
    if (!db) { res.json({ service: { id: Date.now(), name, description, category, isActive: true, usageCount: 0 } }); return; }
    const [service] = await db.insert(services).values({ name, description, category }).returning();
    res.json({ service, message: "Servicio creado" });
  } catch (error) { res.status(500).json({ error: "Error" }); }
});

adminRouter.put("/services/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, category, isActive } = req.body;
    if (!db) { res.json({ service: { id, ...req.body } }); return; }
    const [service] = await db.update(services).set({ name, description, category, isActive }).where(eq(services.id, id)).returning();
    res.json({ service, message: "Servicio actualizado" });
  } catch (error) { res.status(500).json({ error: "Error" }); }
});

adminRouter.delete("/services/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!db) { res.json({ message: "Eliminado" }); return; }
    await db.delete(services).where(eq(services.id, id));
    res.json({ message: "Servicio eliminado" });
  } catch(error) { res.status(500).json({ error: "Error" }); }
});

// ============ REVENUE ANALYTICS ============

adminRouter.get("/revenue/by-user", async (_req, res) => {
  try {
    if (!db) {
      res.json({
        data: [
          { userId: 1, name: "Juan P.", totalPaid: "48.00", plan: "Impacto Global" },
          { userId: 2, name: "María G.", totalPaid: "24.00", plan: "Desarrollo Rural" },
          { userId: 3, name: "Carlos R.", totalPaid: "24.00", plan: "Desarrollo Rural" },
          { userId: 4, name: "Ana L.", totalPaid: "48.00", plan: "Impacto Global" },
        ],
      });
      return;
    }
    const data = await db
      .select({
        userId: subscriptions.userId,
        totalPaid: sum(subscriptions.amountPaid),
      })
      .from(subscriptions)
      .groupBy(subscriptions.userId);
    res.json({ data });
  } catch (error) { res.json({ data: [] }); }
});

adminRouter.get("/revenue/by-plan", async (_req, res) => {
  try {
    if (!db) {
      res.json({
        data: [
          { plan: "Raíz Solidaria", revenue: "0", subscribers: 89 },
          { plan: "Desarrollo Rural", revenue: "980.00", subscribers: 45 },
          { plan: "Impacto Global", revenue: "1470.00", subscribers: 22 },
        ],
      });
      return;
    }
    const data = await db
      .select({
        planId: subscriptions.planId,
        revenue: sum(subscriptions.amountPaid),
        subscribers: count(),
      })
      .from(subscriptions)
      .groupBy(subscriptions.planId);
    res.json({ data });
  } catch (error) { res.json({ data: [] }); }
});

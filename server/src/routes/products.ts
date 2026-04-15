import { Router } from "express";
import { db } from "../db/index.js";
import { products, sales } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { authMiddleware, sellerMiddleware, type AuthRequest } from "../middleware/auth.js";

export const productsRouter = Router();

// Mock products
const mockProducts = [
  {
    id: 1, sellerId: 1, name: "Kit Huerta Vertical", description: "Kit completo con 4 macetas modulares, sustrato orgánico y semillas",
    price: "25.00", image: null, category: "kits", stock: 50, isActive: true,
    createdAt: new Date(), updatedAt: new Date(), sellerName: "AgroSmart"
  },
  {
    id: 2, sellerId: 1, name: "Sensor de Humedad IoT", description: "Sensor WiFi para monitoreo de humedad del suelo en tiempo real",
    price: "15.00", image: null, category: "tecnología", stock: 100, isActive: true,
    createdAt: new Date(), updatedAt: new Date(), sellerName: "AgroSmart"
  },
  {
    id: 3, sellerId: 2, name: "Compost Premium 5kg", description: "Abono orgánico de alta calidad, procesado con tecnología inteligente",
    price: "8.00", image: null, category: "insumos", stock: 200, isActive: true,
    createdAt: new Date(), updatedAt: new Date(), sellerName: "EcoGreen"
  },
  {
    id: 4, sellerId: 2, name: "Semillas Orgánicas Mix", description: "Variedad de semillas: tomate, lechuga, albahaca, cilantro",
    price: "5.00", image: null, category: "semillas", stock: 300, isActive: true,
    createdAt: new Date(), updatedAt: new Date(), sellerName: "EcoGreen"
  },
];

// GET /api/products
productsRouter.get("/", async (_req, res) => {
  try {
    if (!db) {
      res.json({ products: mockProducts });
      return;
    }
    const allProducts = await db.select().from(products).where(eq(products.isActive, true)).orderBy(desc(products.createdAt));
    res.json({ products: allProducts.length > 0 ? allProducts : mockProducts });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.json({ products: mockProducts });
  }
});

// GET /api/products/mine
productsRouter.get("/mine", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!db) {
      res.json({ products: mockProducts.filter(p => p.sellerId === req.user!.id) });
      return;
    }
    const myProducts = await db.select().from(products).where(eq(products.sellerId, req.user!.id));
    res.json({ products: myProducts });
  } catch (error) {
    console.error("Error:", error);
    res.json({ products: [] });
  }
});

// POST /api/products
productsRouter.post("/", authMiddleware, sellerMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, description, price, image, category, stock } = req.body;
    if (!name || !price) {
      res.status(400).json({ error: "Nombre y precio son requeridos" });
      return;
    }

    if (!db) {
      const newProduct = { id: Date.now(), sellerId: req.user!.id, name, description, price, image, category, stock: stock || 0, isActive: true, createdAt: new Date(), updatedAt: new Date() };
      res.json({ product: newProduct, message: "Producto creado" });
      return;
    }

    const [product] = await db.insert(products).values({
      sellerId: req.user!.id, name, description, price, image, category, stock: stock || 0,
    }).returning();

    res.json({ product, message: "Producto creado exitosamente" });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

// PUT /api/products/:id
productsRouter.put("/:id", authMiddleware, sellerMiddleware, async (req: AuthRequest, res) => {
  try {
    const productId = parseInt(req.params.id as string);
    const { name, description, price, image, category, stock } = req.body;

    if (!db) {
      res.json({ product: { id: productId, ...req.body }, message: "Producto actualizado" });
      return;
    }

    const [existing] = await db.select().from(products).where(eq(products.id, productId));
    if (!existing || (existing.sellerId !== req.user!.id && req.user!.role !== "admin")) {
      res.status(403).json({ error: "No autorizado" });
      return;
    }

    const [updated] = await db.update(products)
      .set({ name, description, price, image, category, stock, updatedAt: new Date() })
      .where(eq(products.id, productId))
      .returning();

    res.json({ product: updated, message: "Producto actualizado" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

// DELETE /api/products/:id
productsRouter.delete("/:id", authMiddleware, sellerMiddleware, async (req: AuthRequest, res) => {
  try {
    const productId = parseInt(req.params.id as string);

    if (!db) {
      res.json({ message: "Producto eliminado" });
      return;
    }

    const [existing] = await db.select().from(products).where(eq(products.id, productId));
    if (!existing || (existing.sellerId !== req.user!.id && req.user!.role !== "admin")) {
      res.status(403).json({ error: "No autorizado" });
      return;
    }

    await db.update(products).set({ isActive: false }).where(eq(products.id, productId));
    res.json({ message: "Producto eliminado" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

// POST /api/products/:id/buy
productsRouter.post("/:id/buy", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const productId = parseInt(req.params.id as string);
    const { quantity } = req.body;
    const qty = quantity || 1;

    if (!db) {
      const product = mockProducts.find(p => p.id === productId);
      if (!product) { res.status(404).json({ error: "Producto no encontrado" }); return; }
      const total = parseFloat(product.price) * qty;
      res.json({ sale: { id: Date.now(), productId, buyerId: req.user!.id, sellerId: product.sellerId, quantity: qty, totalAmount: total.toFixed(2) }, message: "Compra realizada" });
      return;
    }

    const [product] = await db.select().from(products).where(eq(products.id, productId));
    if (!product) { res.status(404).json({ error: "Producto no encontrado" }); return; }
    if (product.stock !== null && product.stock < qty) { res.status(400).json({ error: "Stock insuficiente" }); return; }

    const totalAmount = (parseFloat(product.price) * qty).toFixed(2);

    const [sale] = await db.insert(sales).values({
      productId, buyerId: req.user!.id, sellerId: product.sellerId, quantity: qty, totalAmount,
    }).returning();

    if (product.stock !== null) {
      await db.update(products).set({ stock: product.stock - qty }).where(eq(products.id, productId));
    }

    res.json({ sale, message: "Compra realizada exitosamente" });
  } catch (error) {
    console.error("Error buying product:", error);
    res.status(500).json({ error: "Error al comprar" });
  }
});

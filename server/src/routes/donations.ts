import { Router } from "express";
import { db } from "../db/index.js";
import { donations, users } from "../db/schema.js";
import { desc, sum, eq, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";

export const donationsRouter = Router();

// Mock donation data
const mockDonations = [
  { id: 1, userId: 1, amount: "0.60", source: "plan_purchase", createdAt: new Date(Date.now() - 86400000 * 30), userName: "Juan P." },
  { id: 2, userId: 2, amount: "1.20", source: "plan_purchase", createdAt: new Date(Date.now() - 86400000 * 25), userName: "María G." },
  { id: 3, userId: 3, amount: "0.60", source: "plan_purchase", createdAt: new Date(Date.now() - 86400000 * 20), userName: "Carlos R." },
  { id: 4, userId: 1, amount: "0.60", source: "plan_purchase", createdAt: new Date(Date.now() - 86400000 * 15), userName: "Juan P." },
  { id: 5, userId: 4, amount: "1.20", source: "plan_purchase", createdAt: new Date(Date.now() - 86400000 * 10), userName: "Ana L." },
  { id: 6, userId: 2, amount: "1.20", source: "plan_purchase", createdAt: new Date(Date.now() - 86400000 * 5), userName: "María G." },
  { id: 7, userId: 5, amount: "0.60", source: "plan_purchase", createdAt: new Date(), userName: "Pedro M." },
];

// GET /api/donations
donationsRouter.get("/", async (_req, res) => {
  try {
    if (!db) {
      const total = mockDonations.reduce((s, d) => s + parseFloat(d.amount), 0);
      const byMonth = [
        { month: "Ene", amount: 1.80 },
        { month: "Feb", amount: 2.40 },
        { month: "Mar", amount: 3.00 },
        { month: "Abr", amount: 2.40 },
      ];
      res.json({
        totalDonated: total.toFixed(2),
        donationsCount: mockDonations.length,
        byMonth,
        recentDonations: mockDonations.slice(-5).reverse(),
      });
      return;
    }

    const totalResult = await db.select({ total: sum(donations.amount) }).from(donations);
    const total = totalResult[0]?.total || "0";

    const recentDonations = await db
      .select()
      .from(donations)
      .orderBy(desc(donations.createdAt))
      .limit(20);

    const monthlyData = await db
      .select({
        month: sql<string>`TO_CHAR(${donations.createdAt}, 'Mon')`,
        amount: sum(donations.amount),
      })
      .from(donations)
      .groupBy(sql`TO_CHAR(${donations.createdAt}, 'Mon'), EXTRACT(MONTH FROM ${donations.createdAt})`)
      .orderBy(sql`EXTRACT(MONTH FROM ${donations.createdAt})`);

    res.json({
      totalDonated: total,
      donationsCount: recentDonations.length,
      byMonth: monthlyData,
      recentDonations,
    });
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.json({ totalDonated: "0", donationsCount: 0, byMonth: [], recentDonations: [] });
  }
});

// GET /api/donations/history
donationsRouter.get("/history", authMiddleware, async (_req, res) => {
  try {
    if (!db) {
      res.json({ donations: mockDonations });
      return;
    }
    const allDonations = await db.select().from(donations).orderBy(desc(donations.createdAt));
    res.json({ donations: allDonations });
  } catch (error) {
    console.error("Error fetching donation history:", error);
    res.json({ donations: [] });
  }
});

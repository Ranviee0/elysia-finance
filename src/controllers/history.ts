import { Elysia, t } from "elysia";
import { prisma } from "@/lib/prisma";

export const historyController = new Elysia({ prefix: "/history" }).get(
  "/",
  async () => {
    const transactions = await prisma.transaction.findMany({
      orderBy: { id: "asc" },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    return transactions;
  }
);

import { Elysia, t } from "elysia";
import { prisma } from "@/lib/prisma";

export const historyController = new Elysia({ prefix: "/history" }).get(
  "/all",
  async ({ query }) => {
    const accountId = parseInt(query.accountId);

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [{ atAccountId: accountId }, { toAccountId: accountId }],
      },
      orderBy: { id: "asc" },
      select: {
        id: true,
        amount: true,
        type: true,
        atAccountId: true,
        toAccountId: true,
        occurredAt: true,
        createdAt: true,
      },
    });

    // Calculate running balance for specific account
    let balance = 0;
    const transactionsWithBalance = transactions.map((tx) => {
      if (tx.atAccountId === accountId) {
        if (tx.type === "INCOME") {
          balance += tx.amount;
        } else if (tx.type === "EXPENSE") {
          balance -= tx.amount;
        } else if (tx.type === "TRANSFER") {
          balance -= tx.amount;
        }
      }
      if (tx.toAccountId === accountId && tx.type === "TRANSFER") {
        balance += tx.amount;
      }

      return {
        ...tx,
        balance,
      };
    });

    return transactionsWithBalance;
  },
  {
    query: t.Object({
      accountId: t.String(),
    }),
  }
);

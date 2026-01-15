import { Elysia, t } from "elysia";
import { prisma } from "@/lib/prisma";
import { calculateAccountBalance } from "@/lib/balance";

export const expenseController = new Elysia({
  prefix: "/transaction/expense",
}).post(
  "/create",
  async ({ body, status }) => {
    const occurredAt = body.occurredAt ? new Date(body.occurredAt) : new Date();
    occurredAt.setUTCHours(0, 0, 0, 0);

    // Check if expense would make account negative
    const currentBalance = await calculateAccountBalance(body.atAccountId);
    if (currentBalance - body.amount < 0) {
      return status(400, "Insufficient balance");
    }

    const expenseTransaction = await prisma.transaction.create({
      data: {
        type: "EXPENSE",
        amount: body.amount,
        tagId: body.tagId,
        occurredAt: occurredAt,
        atAccountId: body.atAccountId,
      },
    });

    const newBalance = await calculateAccountBalance(body.atAccountId);

    status(201);
    return {
      ...expenseTransaction,
      id: parseInt(String(expenseTransaction.id)),
      atAccountId: parseInt(String(expenseTransaction.atAccountId)),
      newBalance,
    };
  },
  {
    body: t.Object({
      amount: t.Number(),
      tagId: t.Optional(t.Number()),
      occurredAt: t.Optional(t.String()),
      atAccountId: t.Number(),
    }),
  }
);

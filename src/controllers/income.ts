import { Elysia, t } from "elysia";
import { prisma } from "@/lib/prisma";
import { calculateAccountBalance } from "@/lib/balance";

export const incomeController = new Elysia({
  prefix: "/transaction/income",
}).post(
  "/create",
  async ({ body, status }) => {
    const occurredAt = body.occurredAt ? new Date(body.occurredAt) : new Date();
    occurredAt.setUTCHours(0, 0, 0, 0);

    const incomeTransaction = await prisma.transaction.create({
      data: {
        type: "INCOME",
        amount: body.amount,
        tagId: body.tagId,
        occurredAt: occurredAt,
        atAccountId: body.atAccountId,
      },
    });

    const newBalance = await calculateAccountBalance(body.atAccountId);

    status(201);
    return {
      ...incomeTransaction,
      id: parseInt(String(incomeTransaction.id)),
      atAccountId: parseInt(String(incomeTransaction.atAccountId)),
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

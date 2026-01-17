import { Elysia, t } from "elysia";
import { prisma } from "@/lib/prisma";
import { calculateAccountBalance } from "@/lib/balance";

export const transferController = new Elysia({
  prefix: "/transaction/transfer",
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

    const transferTransaction = await prisma.transaction.create({
      data: {
        type: "TRANSFER",
        amount: body.amount,
        tagId: body.tagId,
        occurredAt: occurredAt,
        atAccountId: body.atAccountId,
        toAccountId: body.toAccountId,
      },
    });

    status(201);
    return {
      ...transferTransaction,
      id: parseInt(String(transferTransaction.id)),
      atAccountId: parseInt(String(transferTransaction.atAccountId)),
      atAccountBalance: await calculateAccountBalance(
        parseInt(String(transferTransaction.atAccountId))
      ),
      toAccountId: parseInt(String(transferTransaction.toAccountId)),
      toAccountBalance: await calculateAccountBalance(
        parseInt(String(transferTransaction.toAccountId))
      ),
    };
  },
  {
    body: t.Object({
      amount: t.Number(),
      tagId: t.Optional(t.Number()),
      occurredAt: t.Optional(t.String()),
      atAccountId: t.Integer(),
      toAccountId: t.Integer(),
    }),
  }
);

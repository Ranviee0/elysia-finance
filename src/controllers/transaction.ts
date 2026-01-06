import { Elysia, t } from "elysia";
import {
  TransactionPlain,
  TransactionPlainInputCreate,
  TransactionInputUpdate,
} from "@generated/prismabox/Transaction";
import { prisma } from "@/lib/prisma";

// Custom schema that includes the foreign key for transaction creation
const TransactionCreateBody = t.Composite([
  TransactionPlainInputCreate,
  t.Object({
    atAccountId: t.Integer(),
    toAccountId: t.Optional(t.Integer()),
  }),
]);

export const transactionController = new Elysia({ prefix: "/transaction" })
  .get("/", async () => {
    const transactions = await prisma.transaction.findMany({
      select: {
        id: true,
        type: true,
        amount: true,
        tag: true,
        createdAt: true,
        occurredAt: true,
        atAccount: true,
        toAccount: true,
      },
    });

    // Only return toAccount if it exists
    return transactions.map((t) => {
      const { toAccount, ...rest } = t;
      return toAccount ? { ...rest, toAccount } : rest;
    });
  })
  .get("/:id", async ({ params: { id }, status }) => {
    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        type: true,
        amount: true,
        tag: true,
        createdAt: true,
        occurredAt: true,
        atAccount: true,
        toAccount: true,
      },
    });

    if (!transaction) return status(404, "Transaction not found");

    // Only return toAccount if it exists
    const { toAccount, ...rest } = transaction;
    return toAccount ? { ...rest, toAccount } : rest;
  })
  .post(
    "/create",
    async ({ body }) => {
      const transaction = await prisma.transaction.create({
        data: body,
      });
      return {
        ...transaction,
        id: parseInt(String(transaction.id)),
        atAccountId: parseInt(String(transaction.atAccountId)),
        toAccountId: transaction.toAccountId
          ? parseInt(String(transaction.toAccountId))
          : null,
      };
    },
    {
      body: TransactionCreateBody,
      response: TransactionPlain,
    }
  )
  .put(
    "/update/:id",
    async ({ params: { id }, body, status }) => {
      const transaction = await prisma.transaction.update({
        where: { id: parseInt(id) },
        data: body,
      });

      if (!transaction) return status(404, "Transaction not found");
      return transaction;
    },
    {
      body: TransactionInputUpdate,
      response: {
        200: TransactionPlain,
        404: t.String(),
      },
    }
  );

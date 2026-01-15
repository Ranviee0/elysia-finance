import { Elysia, t } from "elysia";
import { prisma } from "@/lib/prisma";
import { calculateAccountBalance } from "@/lib/balance";

export const balanceController = new Elysia({ prefix: "/balance" })
  .get("/", async () => {
    const accounts = await prisma.account.findMany();

    const accountBalances = await Promise.all(
      accounts.map(async (account) => {
        const balance = await calculateAccountBalance(account.id);
        return {
          id: account.id,
          name: account.name,
          balance,
        };
      })
    );

    return {
      accounts: accountBalances,
    };
  })
  .get("/:id", async ({ params: { id }, status }) => {
    const account = await prisma.account.findUnique({
      where: { id: parseInt(id) },
    });

    if (!account) return status(404, "Account not found");

    const balance = await calculateAccountBalance(account.id);

    return {
      id: account.id,
      name: account.name,
      balance,
    };
  })
  .get("/at-transaction/:id", async ({ params: { id } }) => {
    const transactionId = parseInt(id);
    const accountId = await prisma.transaction
      .findUnique({
        where: { id: transactionId },
      })
      .then((tx) => (tx ? tx.atAccountId : null));

    if (accountId === null) {
      return [];
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [{ atAccountId: accountId }, { toAccountId: accountId }],
        id: { lte: transactionId },
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

    return {
      history: transactionsWithBalance,
      currentBalanceAtTransaction: balance,
      accountId: accountId,
    };
  });

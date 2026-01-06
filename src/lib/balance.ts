import { prisma } from "./prisma";

export async function calculateAccountBalance(accountId: number): Promise<number> {
  // Get all transactions where this account is involved
  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [{ atAccountId: accountId }, { toAccountId: accountId }],
    },
  });

  let balance = 0;

  for (const tx of transactions) {
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
  }

  return balance;
}

// Optimized: Single query for all balances (avoids N+1)
export async function calculateAllBalances(): Promise<Record<number, number>> {
  const accounts = await prisma.account.findMany();
  const transactions = await prisma.transaction.findMany();

  const balances: Record<number, number> = {};

  // Initialize all accounts with 0
  for (const account of accounts) {
    balances[account.id] = 0;
  }

  // Process all transactions in memory
  for (const tx of transactions) {
    if (tx.type === "INCOME") {
      balances[tx.atAccountId] += tx.amount;
    } else if (tx.type === "EXPENSE") {
      balances[tx.atAccountId] -= tx.amount;
    } else if (tx.type === "TRANSFER") {
      balances[tx.atAccountId] -= tx.amount;
      if (tx.toAccountId) {
        balances[tx.toAccountId] += tx.amount;
      }
    }
  }

  return balances;
}

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

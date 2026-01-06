import { Elysia, t } from "elysia";
import { prisma } from "@/lib/prisma";
import { calculateAccountBalance, calculateAllBalances } from "@/lib/balance";

export const balanceController = new Elysia({ prefix: "/balance" })
  .get("/", async () => {
    const accounts = await prisma.account.findMany();
    const balances = await calculateAllBalances();

    const accountBalances = accounts.map((account) => ({
      id: account.id,
      name: account.name,
      balance: balances[account.id] || 0,
    }));

    const totalBalance = accountBalances.reduce(
      (sum, acc) => sum + acc.balance,
      0
    );

    return {
      total: totalBalance,
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
  });

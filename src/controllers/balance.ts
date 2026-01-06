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
  });

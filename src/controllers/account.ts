import { Elysia, t } from "elysia";
import {
  AccountPlain,
  AccountPlainInputCreate,
  AccountInputUpdate,
} from "@generated/prismabox/Account";
import { prisma } from "@/lib/prisma";
import { calculateAccountBalance } from "@/lib/balance";

export const accountController = new Elysia({ prefix: "/account" })
  .get("/:id", async ({ params: { id }, status }) => {
    const account = await prisma.account.findUnique({
      where: { id: parseInt(id) },
    });

    if (!account) return status(404, "Account not found");

    const balance = await calculateAccountBalance(account.id);
    return { ...account, balance };
  })
  .get("/all", async () => {
    const accounts = await prisma.account.findMany();

    return accounts.map((account) => ({
      ...account,
      id: parseInt(String(account.id)),
    }));
  })
  .post(
    "/create",
    async ({ body }) => {
      const account = await prisma.account.create({
        data: body,
      });
      return {
        ...account,
        id: parseInt(String(account.id)),
      };
    },
    {
      body: AccountPlainInputCreate,
      response: AccountPlain,
    }
  )
  .put(
    "/update/:id",
    async ({ params: { id }, body, status }) => {
      const account = await prisma.account.update({
        where: { id: parseInt(id) },
        data: body,
      });

      if (!account) return status(404, "Account not found");
      return account;
    },
    {
      body: AccountInputUpdate,
      response: {
        200: AccountPlain,
        404: t.String(),
      },
    }
  )
  .delete(
    "/delete/:id",
    async ({ params: { id }, status }) => {
      try {
        const account = await prisma.account.delete({
          where: { id: parseInt(id) },
        });
        return {
          message: `Account ${account.name} (ID: ${id}) deleted successfully`,
        };
      } catch (error) {
        return status(404, "Account not found");
      }
    },
    {
      response: {
        200: t.Object({ message: t.String() }),
        404: t.String(),
      },
    }
  );

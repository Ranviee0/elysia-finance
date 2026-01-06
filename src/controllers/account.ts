import { Elysia, t } from "elysia";
import {
  AccountPlain,
  AccountPlainInputCreate,
  AccountInputUpdate,
} from "@generated/prismabox/Account";
import { prisma } from "@/lib/prisma";

export const accountController = new Elysia({ prefix: "/account" }).post(
  "/account/create",
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
);

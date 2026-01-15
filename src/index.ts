import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { transactionController } from "@/controllers/transaction";
import { accountController } from "@/controllers/account";
import { balanceController } from "@/controllers/balance";
import { tagGroupController } from "./controllers/tag-group";
import { tagController } from "@/controllers/tag";
import { incomeController } from "./controllers/income";
import { expenseController } from "./controllers/expense";
import { Tag } from "@generated/prismabox/Tag";

new Elysia()
  .get("/", () => "Elysia Finance API")
  .use(openapi())
  .use(transactionController)
  .use(accountController)
  .use(balanceController)
  .use(tagController)
  .use(tagGroupController)
  .use(incomeController)
  .use(expenseController)
  .listen(3000, () => {
    console.log("🦊 Elysia is running at http://localhost:3000");
  });

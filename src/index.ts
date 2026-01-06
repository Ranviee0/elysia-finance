import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";
import { transactionController } from "@/controllers/transaction";
import { accountController } from "@/controllers/account";
import { balanceController } from "@/controllers/balance";

new Elysia()
  .get("/", () => "Elysia Finance API")
  .use(openapi())
  .use(transactionController)
  .use(accountController)
  .use(balanceController)
  .listen(3000, () => {
    console.log("🦊 Elysia is running at http://localhost:3000");
  });

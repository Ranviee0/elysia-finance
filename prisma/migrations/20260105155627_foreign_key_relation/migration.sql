/*
  Warnings:

  - You are about to drop the column `atAccount` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `toAccount` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `atAccountId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" REAL NOT NULL,
    "atAccountId" INTEGER NOT NULL,
    "toAccountId" INTEGER,
    "type" TEXT NOT NULL,
    "tag" TEXT,
    "occurredAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_atAccountId_fkey" FOREIGN KEY ("atAccountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_toAccountId_fkey" FOREIGN KEY ("toAccountId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "createdAt", "id", "occurredAt", "tag", "type") SELECT "amount", "createdAt", "id", "occurredAt", "tag", "type" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

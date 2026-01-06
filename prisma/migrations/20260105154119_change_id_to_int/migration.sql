/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `CreditTransaction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `CreditTransaction` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `Transaction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_Account" ("id", "name") SELECT "id", "name" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE TABLE "new_CreditTransaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" REAL NOT NULL,
    "tag" TEXT,
    "occurredAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_CreditTransaction" ("amount", "createdAt", "id", "occurredAt", "tag") SELECT "amount", "createdAt", "id", "occurredAt", "tag" FROM "CreditTransaction";
DROP TABLE "CreditTransaction";
ALTER TABLE "new_CreditTransaction" RENAME TO "CreditTransaction";
CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" REAL NOT NULL,
    "atAccount" TEXT NOT NULL,
    "toAccount" TEXT,
    "type" TEXT NOT NULL,
    "tag" TEXT,
    "occurredAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Transaction" ("amount", "atAccount", "createdAt", "id", "occurredAt", "tag", "toAccount", "type") SELECT "amount", "atAccount", "createdAt", "id", "occurredAt", "tag", "toAccount", "type" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

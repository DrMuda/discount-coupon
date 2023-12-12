/*
  Warnings:

  - You are about to drop the column `useInCart` on the `DiscountCode` table. All the data in the column will be lost.
  - You are about to drop the column `useInProductDetail` on the `DiscountCode` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DiscountCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shopifyDiscountCodeId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "useGlobalConfig" BOOLEAN NOT NULL DEFAULT true,
    "show" BOOLEAN NOT NULL DEFAULT false,
    "templateId" INTEGER NOT NULL,
    "codeBgColor" TEXT,
    "codeColor" TEXT,
    "textColor" TEXT,
    "btnBgColor" TEXT,
    "btnTextColor" TEXT,
    "leftText" TEXT,
    "whichPage" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_DiscountCode" ("btnBgColor", "btnTextColor", "codeBgColor", "codeColor", "createdAt", "id", "leftText", "shop", "shopifyDiscountCodeId", "templateId", "textColor", "useGlobalConfig", "whichPage") SELECT "btnBgColor", "btnTextColor", "codeBgColor", "codeColor", "createdAt", "id", "leftText", "shop", "shopifyDiscountCodeId", "templateId", "textColor", "useGlobalConfig", "whichPage" FROM "DiscountCode";
DROP TABLE "DiscountCode";
ALTER TABLE "new_DiscountCode" RENAME TO "DiscountCode";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

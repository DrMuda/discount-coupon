/*
  Warnings:

  - You are about to drop the column `shopifyDiscountCode` on the `DiscountCode` table. All the data in the column will be lost.
  - Added the required column `shopifyDiscountCodeId` to the `DiscountCode` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DiscountCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shopifyDiscountCodeId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "useGlobalConfig" BOOLEAN NOT NULL DEFAULT true,
    "useInProductDetail" BOOLEAN NOT NULL DEFAULT false,
    "useInCart" BOOLEAN NOT NULL DEFAULT false,
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
INSERT INTO "new_DiscountCode" ("btnBgColor", "btnTextColor", "codeBgColor", "codeColor", "createdAt", "id", "leftText", "shop", "templateId", "textColor", "useGlobalConfig", "useInCart", "useInProductDetail", "whichPage") SELECT "btnBgColor", "btnTextColor", "codeBgColor", "codeColor", "createdAt", "id", "leftText", "shop", "templateId", "textColor", "useGlobalConfig", "useInCart", "useInProductDetail", "whichPage" FROM "DiscountCode";
DROP TABLE "DiscountCode";
ALTER TABLE "new_DiscountCode" RENAME TO "DiscountCode";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

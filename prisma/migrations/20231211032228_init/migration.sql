/*
  Warnings:

  - You are about to drop the column `btnBgColot` on the `DiscountCode` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DiscountCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_DiscountCode" ("btnTextColor", "codeBgColor", "codeColor", "createdAt", "id", "shop", "templateId", "textColor", "useGlobalConfig", "useInCart", "useInProductDetail") SELECT "btnTextColor", "codeBgColor", "codeColor", "createdAt", "id", "shop", "templateId", "textColor", "useGlobalConfig", "useInCart", "useInProductDetail" FROM "DiscountCode";
DROP TABLE "DiscountCode";
ALTER TABLE "new_DiscountCode" RENAME TO "DiscountCode";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

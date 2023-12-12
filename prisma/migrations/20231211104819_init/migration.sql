/*
  Warnings:

  - The primary key for the `DiscountCode` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DiscountCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
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

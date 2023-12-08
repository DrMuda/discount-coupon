/*
  Warnings:

  - Added the required column `shop` to the `GlobalConfig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shop` to the `DiscountCode` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GlobalConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 0,
    "shop" TEXT NOT NULL,
    "styleId" INTEGER NOT NULL,
    "codeBgColor" TEXT,
    "codeColor" TEXT,
    "textColor" TEXT,
    "btnBgColot" TEXT,
    "btnTextColor" TEXT,
    "sort" TEXT
);
INSERT INTO "new_GlobalConfig" ("btnBgColot", "btnTextColor", "codeBgColor", "codeColor", "id", "sort", "styleId", "textColor") SELECT "btnBgColot", "btnTextColor", "codeBgColor", "codeColor", "id", "sort", "styleId", "textColor" FROM "GlobalConfig";
DROP TABLE "GlobalConfig";
ALTER TABLE "new_GlobalConfig" RENAME TO "GlobalConfig";
CREATE TABLE "new_DiscountCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "useGlobalConfig" BOOLEAN NOT NULL DEFAULT true,
    "useInProductDetail" BOOLEAN NOT NULL DEFAULT false,
    "useInCart" BOOLEAN NOT NULL DEFAULT false,
    "styleId" INTEGER NOT NULL,
    "codeBgColor" TEXT,
    "codeColor" TEXT,
    "textColor" TEXT,
    "btnBgColot" TEXT,
    "btnTextColor" TEXT,
    "bannerBgColor" TEXT,
    "bannerTextColot" TEXT,
    "bannerBtnBgColor" TEXT,
    "bannerBtnTextColor" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_DiscountCode" ("bannerBgColor", "bannerBtnBgColor", "bannerBtnTextColor", "bannerTextColot", "btnBgColot", "btnTextColor", "codeBgColor", "codeColor", "createdAt", "id", "styleId", "textColor", "useGlobalConfig", "useInCart", "useInProductDetail") SELECT "bannerBgColor", "bannerBtnBgColor", "bannerBtnTextColor", "bannerTextColot", "btnBgColot", "btnTextColor", "codeBgColor", "codeColor", "createdAt", "id", "styleId", "textColor", "useGlobalConfig", "useInCart", "useInProductDetail" FROM "DiscountCode";
DROP TABLE "DiscountCode";
ALTER TABLE "new_DiscountCode" RENAME TO "DiscountCode";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

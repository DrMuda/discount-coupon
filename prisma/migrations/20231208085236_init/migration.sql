/*
  Warnings:

  - You are about to drop the `Style` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `styleId` on the `GlobalConfig` table. All the data in the column will be lost.
  - You are about to drop the column `styleId` on the `DiscountCode` table. All the data in the column will be lost.
  - Added the required column `templateId` to the `DiscountCode` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Style";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Template" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "codeBgColor" TEXT,
    "codeColor" TEXT,
    "textColor" TEXT,
    "btnBgColot" TEXT,
    "btnTextColor" TEXT
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GlobalConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 0,
    "shop" TEXT NOT NULL,
    "templateId" INTEGER,
    "codeBgColor" TEXT,
    "codeColor" TEXT,
    "textColor" TEXT,
    "btnBgColot" TEXT,
    "btnTextColor" TEXT,
    "sort" TEXT
);
INSERT INTO "new_GlobalConfig" ("btnBgColot", "btnTextColor", "codeBgColor", "codeColor", "id", "shop", "sort", "textColor") SELECT "btnBgColot", "btnTextColor", "codeBgColor", "codeColor", "id", "shop", "sort", "textColor" FROM "GlobalConfig";
DROP TABLE "GlobalConfig";
ALTER TABLE "new_GlobalConfig" RENAME TO "GlobalConfig";
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
    "btnBgColot" TEXT,
    "btnTextColor" TEXT,
    "bannerBgColor" TEXT,
    "bannerTextColot" TEXT,
    "bannerBtnBgColor" TEXT,
    "bannerBtnTextColor" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_DiscountCode" ("bannerBgColor", "bannerBtnBgColor", "bannerBtnTextColor", "bannerTextColot", "btnBgColot", "btnTextColor", "codeBgColor", "codeColor", "createdAt", "id", "shop", "textColor", "useGlobalConfig", "useInCart", "useInProductDetail") SELECT "bannerBgColor", "bannerBtnBgColor", "bannerBtnTextColor", "bannerTextColot", "btnBgColot", "btnTextColor", "codeBgColor", "codeColor", "createdAt", "id", "shop", "textColor", "useGlobalConfig", "useInCart", "useInProductDetail" FROM "DiscountCode";
DROP TABLE "DiscountCode";
ALTER TABLE "new_DiscountCode" RENAME TO "DiscountCode";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

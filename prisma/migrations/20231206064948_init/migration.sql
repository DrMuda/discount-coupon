-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DiscountCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
INSERT INTO "new_DiscountCode" ("bannerBgColor", "bannerBtnBgColor", "bannerBtnTextColor", "bannerTextColot", "btnBgColot", "btnTextColor", "codeBgColor", "codeColor", "createdAt", "id", "styleId", "textColor", "useInCart", "useInProductDetail") SELECT "bannerBgColor", "bannerBtnBgColor", "bannerBtnTextColor", "bannerTextColot", "btnBgColot", "btnTextColor", "codeBgColor", "codeColor", "createdAt", "id", "styleId", "textColor", "useInCart", "useInProductDetail" FROM "DiscountCode";
DROP TABLE "DiscountCode";
ALTER TABLE "new_DiscountCode" RENAME TO "DiscountCode";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

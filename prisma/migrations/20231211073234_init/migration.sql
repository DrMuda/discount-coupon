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
    "leftText" TEXT,
    "whichPage" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_DiscountCode" ("btnBgColor", "btnTextColor", "codeBgColor", "codeColor", "createdAt", "id", "leftText", "shop", "templateId", "textColor", "useGlobalConfig", "useInCart", "useInProductDetail") SELECT "btnBgColor", "btnTextColor", "codeBgColor", "codeColor", "createdAt", "id", "leftText", "shop", "templateId", "textColor", "useGlobalConfig", "useInCart", "useInProductDetail" FROM "DiscountCode";
DROP TABLE "DiscountCode";
ALTER TABLE "new_DiscountCode" RENAME TO "DiscountCode";
CREATE TABLE "new_GlobalConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 0,
    "shop" TEXT NOT NULL,
    "templateId" INTEGER,
    "codeBgColor" TEXT,
    "codeColor" TEXT,
    "textColor" TEXT,
    "btnBgColor" TEXT,
    "btnTextColor" TEXT,
    "sort" TEXT,
    "whichPage" INTEGER NOT NULL DEFAULT 1
);
INSERT INTO "new_GlobalConfig" ("btnBgColor", "btnTextColor", "codeBgColor", "codeColor", "id", "shop", "sort", "templateId", "textColor") SELECT "btnBgColor", "btnTextColor", "codeBgColor", "codeColor", "id", "shop", "sort", "templateId", "textColor" FROM "GlobalConfig";
DROP TABLE "GlobalConfig";
ALTER TABLE "new_GlobalConfig" RENAME TO "GlobalConfig";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

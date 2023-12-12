-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GlobalConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
INSERT INTO "new_GlobalConfig" ("btnBgColor", "btnTextColor", "codeBgColor", "codeColor", "id", "shop", "sort", "templateId", "textColor", "whichPage") SELECT "btnBgColor", "btnTextColor", "codeBgColor", "codeColor", "id", "shop", "sort", "templateId", "textColor", "whichPage" FROM "GlobalConfig";
DROP TABLE "GlobalConfig";
ALTER TABLE "new_GlobalConfig" RENAME TO "GlobalConfig";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

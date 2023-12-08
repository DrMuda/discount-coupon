-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GlobalConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 0,
    "shop" TEXT NOT NULL,
    "styleId" INTEGER,
    "codeBgColor" TEXT,
    "codeColor" TEXT,
    "textColor" TEXT,
    "btnBgColot" TEXT,
    "btnTextColor" TEXT,
    "sort" TEXT
);
INSERT INTO "new_GlobalConfig" ("btnBgColot", "btnTextColor", "codeBgColor", "codeColor", "id", "shop", "sort", "styleId", "textColor") SELECT "btnBgColot", "btnTextColor", "codeBgColor", "codeColor", "id", "shop", "sort", "styleId", "textColor" FROM "GlobalConfig";
DROP TABLE "GlobalConfig";
ALTER TABLE "new_GlobalConfig" RENAME TO "GlobalConfig";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

/*
  Warnings:

  - You are about to drop the column `btnBgColot` on the `GlobalConfig` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GlobalConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 0,
    "shop" TEXT NOT NULL,
    "templateId" INTEGER,
    "codeBgColor" TEXT,
    "codeColor" TEXT,
    "textColor" TEXT,
    "btnBgColor" TEXT,
    "btnTextColor" TEXT,
    "sort" TEXT
);
INSERT INTO "new_GlobalConfig" ("btnTextColor", "codeBgColor", "codeColor", "id", "shop", "sort", "templateId", "textColor") SELECT "btnTextColor", "codeBgColor", "codeColor", "id", "shop", "sort", "templateId", "textColor" FROM "GlobalConfig";
DROP TABLE "GlobalConfig";
ALTER TABLE "new_GlobalConfig" RENAME TO "GlobalConfig";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

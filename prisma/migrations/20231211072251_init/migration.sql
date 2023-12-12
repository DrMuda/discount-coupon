/*
  Warnings:

  - You are about to drop the column `btnBgColot` on the `Template` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Template" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "codeBgColor" TEXT,
    "codeColor" TEXT,
    "textColor" TEXT,
    "btnBgColor" TEXT,
    "btnTextColor" TEXT
);
INSERT INTO "new_Template" ("btnTextColor", "codeBgColor", "codeColor", "id", "name", "textColor") SELECT "btnTextColor", "codeBgColor", "codeColor", "id", "name", "textColor" FROM "Template";
DROP TABLE "Template";
ALTER TABLE "new_Template" RENAME TO "Template";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

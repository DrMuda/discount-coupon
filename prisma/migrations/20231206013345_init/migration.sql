-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" DATETIME,
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT
);

-- CreateTable
CREATE TABLE "Style" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "codeBgColor" TEXT,
    "codeColor" TEXT,
    "textColor" TEXT,
    "btnBgColot" TEXT,
    "btnTextColor" TEXT
);

-- CreateTable
CREATE TABLE "GlobalConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 0,
    "styleId" INTEGER NOT NULL,
    "codeBgColor" TEXT,
    "codeColor" TEXT,
    "textColor" TEXT,
    "btnBgColot" TEXT,
    "btnTextColor" TEXT
);

-- CreateTable
CREATE TABLE "DiscountCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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

-- CreateTable
CREATE TABLE "CommandHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "status" TEXT NOT NULL
);

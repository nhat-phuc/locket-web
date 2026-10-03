-- CreateTable
CREATE TABLE "WheelItem" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'money',
    "color" TEXT NOT NULL DEFAULT '#7c3aed',
    "weight" INTEGER NOT NULL DEFAULT 10,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WheelItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Spin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT,
    "label" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Spin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Spin_userId_idx" ON "Spin"("userId");

-- CreateIndex
CREATE INDEX "Spin_createdAt_idx" ON "Spin"("createdAt");

-- AddForeignKey
ALTER TABLE "Spin" ADD CONSTRAINT "Spin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

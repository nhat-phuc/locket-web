-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "originalPrice" INTEGER,
    "discount" INTEGER,
    "duration" TEXT,
    "features" TEXT NOT NULL,
    "badge" TEXT,
    "badgeColor" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "stock" INTEGER,
    "sold" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Service" ("createdAt", "description", "discount", "duration", "features", "id", "image", "isActive", "isFeatured", "name", "originalPrice", "platform", "price", "slug", "sold", "stock", "type", "updatedAt") SELECT "createdAt", "description", "discount", "duration", "features", "id", "image", "isActive", "isFeatured", "name", "originalPrice", "platform", "price", "slug", "sold", "stock", "type", "updatedAt" FROM "Service";
DROP TABLE "Service";
ALTER TABLE "new_Service" RENAME TO "Service";
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");
CREATE INDEX "Service_slug_idx" ON "Service"("slug");
CREATE INDEX "Service_type_idx" ON "Service"("type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

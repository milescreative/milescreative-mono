/*
  Warnings:

  - You are about to drop the `RateLimit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."RateLimit";

-- CreateTable
CREATE TABLE "public"."rate_limit" (
    "id" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "reset" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rate_limit_pkey" PRIMARY KEY ("id")
);

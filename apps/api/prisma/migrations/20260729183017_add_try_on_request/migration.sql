-- CreateEnum
CREATE TYPE "TryOnStatus" AS ENUM ('processing', 'completed', 'failed');

-- CreateTable
CREATE TABLE "TryOnRequest" (
    "id" TEXT NOT NULL,
    "status" "TryOnStatus" NOT NULL DEFAULT 'processing',
    "items" JSONB NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "lastStepImageUrl" TEXT,
    "resultImageUrl" TEXT,
    "fashnPredictionId" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TryOnRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TryOnRequest_expiresAt_idx" ON "TryOnRequest"("expiresAt");

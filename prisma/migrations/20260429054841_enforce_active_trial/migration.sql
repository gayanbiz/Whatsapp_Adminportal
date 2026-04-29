-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('TRIAL', 'ANNUAL');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "phone_number" TEXT NOT NULL,
    "display_name" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "plan_type" "PlanType" NOT NULL DEFAULT 'TRIAL',
    "plan_start_date" TIMESTAMP(3),
    "plan_end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

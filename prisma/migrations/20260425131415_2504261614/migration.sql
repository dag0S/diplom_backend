/*
  Warnings:

  - You are about to drop the column `doctorId` on the `consultations` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `consultations` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `otps` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `two_factor` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isTwoFactorEnabled` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `twoFactorId` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `otps` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `two_factor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `doctor_id` to the `consultations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patient_id` to the `consultations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `otps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `two_factor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "consultations" DROP CONSTRAINT "consultations_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "consultations" DROP CONSTRAINT "consultations_patientId_fkey";

-- DropForeignKey
ALTER TABLE "otps" DROP CONSTRAINT "otps_userId_fkey";

-- DropForeignKey
ALTER TABLE "two_factor" DROP CONSTRAINT "two_factor_userId_fkey";

-- DropIndex
DROP INDEX "otps_userId_key";

-- DropIndex
DROP INDEX "two_factor_userId_key";

-- AlterTable
ALTER TABLE "consultations" DROP COLUMN "doctorId",
DROP COLUMN "patientId",
ADD COLUMN     "doctor_id" TEXT NOT NULL,
ADD COLUMN     "patient_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "otps" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "two_factor" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "isEmailVerified",
DROP COLUMN "isTwoFactorEnabled",
DROP COLUMN "twoFactorId",
ADD COLUMN     "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_two_factor_enabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "otps_user_id_key" ON "otps"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "two_factor_user_id_key" ON "two_factor"("user_id");

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otps" ADD CONSTRAINT "otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

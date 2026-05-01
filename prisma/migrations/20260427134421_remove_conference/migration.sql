/*
  Warnings:

  - You are about to drop the column `conference_id` on the `consultations` table. All the data in the column will be lost.
  - You are about to drop the column `conference_url` on the `consultations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "consultations" DROP COLUMN "conference_id",
DROP COLUMN "conference_url";

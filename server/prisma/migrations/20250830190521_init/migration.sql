/*
  Warnings:

  - You are about to alter the column `revenue` on the `Event` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.

*/
-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "revenue" SET DATA TYPE DECIMAL(12,2);

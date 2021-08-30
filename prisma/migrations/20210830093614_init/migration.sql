/*
  Warnings:

  - You are about to alter the column `status` on the `Warlock` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `Warlock` MODIFY `status` VARCHAR(191);

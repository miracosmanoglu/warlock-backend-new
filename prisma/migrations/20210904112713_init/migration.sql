/*
  Warnings:

  - Added the required column `image` to the `Warlock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Warlock` ADD COLUMN `image` LONGTEXT NOT NULL;

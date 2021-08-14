/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Horoscope` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Admin` MODIFY `image` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `Blog` MODIFY `image` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `Horoscope` MODIFY `image` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `HoroscopeDescription` MODIFY `image` LONGTEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Horoscope.name_unique` ON `Horoscope`(`name`);

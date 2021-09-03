/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `ForgotTokens` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ForgotTokens.email_unique` ON `ForgotTokens`(`email`);

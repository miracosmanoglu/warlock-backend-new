/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `ForgotTokens` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ForgotTokens.token_unique` ON `ForgotTokens`(`token`);

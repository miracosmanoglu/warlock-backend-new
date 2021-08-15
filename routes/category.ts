import { PrismaClient } from "@prisma/client";
import express from "express";
import { getUserId } from "../utils/authentication";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/all", async (req, res) => {
  const categories = await prisma.category.findMany({});
  res.json(categories);
});

router.post("/", async (req, res) => {
  const { name, description } = req.body;

  const data = await getUserId(req);
  if (
    data === null ||
    data.message ||
    data?.user?.user.role === "WARLOCK" ||
    data?.user?.user.role === "CUSTOMER"
  ) {
    res.send(
      JSON.stringify({
        status: 401,
        error: "JWT expired or not provided",
        response: null,
      })
    );
    return;
  }

  const result = await prisma.category.create({
    data: {
      name,
      description,
    },
  });

  res.json(result);
});
module.exports = router;

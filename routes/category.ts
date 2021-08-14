import { PrismaClient } from "@prisma/client";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import lodash from "lodash";
import { getUserId } from "../utils/authentication";

const SECRET = "asbadbbdbbh7788888887hb113h3hbb";
const prisma = new PrismaClient();
const router = express.Router();

router.get("/all", async (req, res) => {
  const categories = await prisma.category.findMany({});
  res.json(categories);
});

router.post("/", async (req, res) => {
  const { name, description } = req.body;

  const user = await getUserId(req);
  if (user === null || user.message) {
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

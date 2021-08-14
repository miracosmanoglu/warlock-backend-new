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
  const blogs = await prisma.blog.findMany({});
  res.json(blogs);
});

router.post("/", async (req, res) => {
  const { title, description, image, adminId } = req.body;

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

  const result = await prisma.blog.create({
    data: {
      title,
      description,
      image,
      adminId,
    },
  });

  res.json(result);
});

router.put("/", async (req, res) => {
  const { title, description, image, id } = req.body;

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

  const blogExist = await prisma.blog.findFirst({
    where: {
      id: id,
    },
  });

  if (!blogExist) {
    return res.status(400).json({
      msg: "blog does not exists",
    });
  }
  const blog = await prisma.blog.update({
    where: { id: id },
    data: { title, description, image },
  });
  res.json(blog);
});

router.delete(`/`, async (req, res) => {
  const { id } = req.body;

  const blogExist = await prisma.blog.findFirst({
    where: {
      id: id,
    },
  });

  if (!blogExist) {
    return res.status(400).json({
      msg: "blog does not exists",
    });
  }
  const blog = await prisma.blog.delete({
    where: {
      id: id,
    },
  });
  res.json(blog);
});

module.exports = router;

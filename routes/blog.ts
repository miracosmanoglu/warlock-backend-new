import { PrismaClient } from "@prisma/client";
import express from "express";
import { getUserId } from "../utils/authentication";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/all", async (req, res) => {
  const blogs = await prisma.blog.findMany({});
  res.json(blogs);
});

router.post("/", async (req, res) => {
  const { title, description, image, adminId } = req.body;

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

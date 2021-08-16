import { PrismaClient } from "@prisma/client";
import express from "express";
import { getUserId } from "../utils/authentication";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/all", async (req, res) => {
  try {
    const blogs = await prisma.blog.findMany();
    res.send(JSON.stringify({ status: 200, error: null, data: blogs }));
  } catch (e) {
    res.status(500);
    res.send(JSON.stringify({ status: 500, error: e, data: null }));
  }
});

router.get("/", async (req, res) => {
  const { id } = req.body;
  try {
    const blog = await prisma.blog.findUnique({
      where: { id: id },
    });
    res.send(JSON.stringify({ status: 200, error: null, data: blog }));
  } catch (error) {
    res.status(404);
    res.send(
      JSON.stringify({ status: 404, error: "Blog not found", data: null })
    );
  }
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
    res.status(401);
    res.send(
      JSON.stringify({
        status: 401,
        error: "JWT expired or not provided",
        data: null,
      })
    );
    return;
  }
  try {
    const result = await prisma.blog.create({
      data: {
        title,
        description,
        image,
        adminId,
      },
    });
    res.send(JSON.stringify({ status: 200, error: null, data: result.id }));
  } catch (error) {
    res.status(404);
    res.send(JSON.stringify({ status: 404, error: error, data: null }));
  }
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
    res.status(401);
    res.send(
      JSON.stringify({
        status: 401,
        error: "JWT expired or not provided",
        data: null,
      })
    );
    return;
  }
  try {
    const blogExist = await prisma.blog.findFirst({
      where: {
        id: id,
      },
    });

    if (!blogExist) {
      res.status(400);
      res.send(
        JSON.stringify({
          status: 400,
          error: "blog does not exist",
          data: null,
        })
      );
    }
    const blog = await prisma.blog.update({
      where: { id: id },
      data: { title, description, image },
    });
    res.send(JSON.stringify({ status: 200, error: null, data: blog.id }));
  } catch (error) {
    res.status(404);
    res.send(JSON.stringify({ status: 404, error: error, data: null }));
  }
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
    res.status(401);
    res.send(
      JSON.stringify({
        status: 401,
        error: "JWT expired or not provided",
        data: null,
      })
    );
    return;
  }
  try {
    const blogExist = await prisma.blog.findFirst({
      where: {
        id: id,
      },
    });

    if (!blogExist) {
      res.status(400);
      res.send(
        JSON.stringify({
          status: 400,
          error: "Blog does not exist",
          data: null,
        })
      );
    }
    const blog = await prisma.blog.delete({
      where: {
        id: id,
      },
    });
    res.send(JSON.stringify({ status: 200, error: null, data: blog.id }));
  } catch (error) {
    res.status(404);
    res.send(JSON.stringify({ status: 404, error: error, data: null }));
  }
});

module.exports = router;

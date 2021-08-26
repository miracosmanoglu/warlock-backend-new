import { PrismaClient } from "@prisma/client";
import express from "express";
import { getUserId } from "../utils/authentication";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const horoscopeDescription = await prisma.horoscopeDescription.findMany({
      where: {
        horoscopeId: parseInt(id),
      },
    });
    res.send(
      JSON.stringify({ status: 200, error: null, data: horoscopeDescription })
    );
  } catch (error) {
    res.status(500);
    res.send(JSON.stringify({ status: 500, error: error, data: null }));
  }
});

router.post("/", async (req, res) => {
  const { title, description, image, horoscopeId } = req.body;

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
    if (data.user) {
      const result = await prisma.horoscopeDescription.create({
        data: {
          title,
          description,
          image,
          horoscopeId,
          adminId: data.user.user.id,
        },
      });
      res.send(JSON.stringify({ status: 200, error: null, data: result.id }));
    }
  } catch (error) {
    res.status(500);
    res.send(JSON.stringify({ status: 500, error: error, data: null }));
  }
});

router.put("/", async (req, res) => {
  const { title, description, image, id } = req.body;

  const data = await getUserId(req);
  if (
    data === null ||
    data.message ||
    data?.user?.user.role === "CUSTOMER" ||
    data?.user?.user.role === "WARLOCK"
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
    const horoscopeDescription = await prisma.horoscopeDescription.update({
      where: { id: id },
      data: { title, description, image },
    });
    res.send(
      JSON.stringify({
        status: 200,
        error: null,
        data: horoscopeDescription.id,
      })
    );
  } catch (error) {
    res.status(500);
    res.send(JSON.stringify({ status: 500, error: error, data: null }));
  }
});

router.delete(`/`, async (req, res) => {
  const { id } = req.body;

  const data = await getUserId(req);
  if (
    data === null ||
    data.message ||
    data?.user?.user.role === "CUSTOMER" ||
    data?.user?.user.role === "WARLOCK"
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
    const horoscopeDescription = await prisma.horoscopeDescription.delete({
      where: {
        id: id,
      },
    });
    res.send(
      JSON.stringify({
        status: 200,
        error: null,
        data: horoscopeDescription.id,
      })
    );
  } catch (error) {
    res.status(500);
    res.send(JSON.stringify({ status: 500, error: error, data: null }));
  }
});

module.exports = router;

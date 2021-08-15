import { PrismaClient } from "@prisma/client";
import express from "express";
import { getUserId } from "../utils/authentication";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", async (req, res) => {
  const { horoscopeId } = req.body;
  const horoscopeDescription = await prisma.horoscopeDescription.findMany({
    where: {
      horoscopeId: horoscopeId,
    },
  });
  res.json(horoscopeDescription);
});

router.post("/", async (req, res) => {
  const { title, description, image, horoscopeId, adminId } = req.body;

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

  const result = await prisma.horoscopeDescription.create({
    data: {
      title,
      description,
      image,
      horoscopeId,
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

  const horoscopeDescription = await prisma.horoscopeDescription.update({
    where: { id: id },
    data: { title, description, image },
  });
  res.json(horoscopeDescription);
});

router.delete(`/`, async (req, res) => {
  const { id } = req.body;

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

  const horoscopeDescription = await prisma.horoscopeDescription.delete({
    where: {
      id: id,
    },
  });
  res.json(horoscopeDescription);
});

module.exports = router;

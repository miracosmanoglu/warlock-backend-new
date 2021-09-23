import { PrismaClient } from "@prisma/client";
import express from "express";
import { getUserId } from "../utils/authentication";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/all", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({});
    res.send(JSON.stringify({ status: 200, error: null, data: categories }));
  } catch (e) {
    res.status(500);
    res.send(JSON.stringify({ status: 500, error: e, data: null }));
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
    });
    res.send(JSON.stringify({ status: 200, error: null, data: category }));
  } catch (error) {
    res.status(404);
    res.send(
      JSON.stringify({ status: 404, error: "Kategori bulunamadı.", data: null })
    );
  }
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
    res.status(401);
    res.send(
      JSON.stringify({
        status: 401,
        error:
          "Kullanıcı bu işlem için uygun değil. Lütfen başka bir hesap ile giriş yapın.",
        data: null,
      })
    );
    return;
  }

  try {
    const result = await prisma.category.create({
      data: {
        name,
        description,
      },
    });

    res.send(JSON.stringify({ status: 200, error: null, data: result.id }));
  } catch (error) {
    res.status(404);
    res.send(JSON.stringify({ status: 404, error: error, data: null }));
  }
});
module.exports = router;

import { PrismaClient } from "@prisma/client";
import express from "express";
import { getUserId } from "../utils/authentication";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", async (req, res) => {
  const { gigId } = req.body;
  try {
    const filteredComments = await prisma.comment.findMany({
      where: {
        gigId: gigId,
      },
    });
    res.send(
      JSON.stringify({ status: 200, error: null, data: filteredComments })
    );
  } catch (error) {
    res.status(404);
    res.send(JSON.stringify({ status: 404, error: error, data: null }));
  }
});

router.post("/", async (req, res) => {
  const { text, rate, gigId } = req.body;

  const data = await getUserId(req);

  if (data === null || data.message) {
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
    if (data.user) {
      const result = await prisma.comment.create({
        data: {
          text,
          rate,
          gigId,
          customerId: data.user.user.id,
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
  const { text, rate, id } = req.body;

  const data = await getUserId(req);

  if (data === null || data.message || data?.user?.user.role === "WARLOCK") {
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
    const commentExist = await prisma.comment.findFirst({
      where: {
        id: id,
      },
    });

    if (!commentExist) {
      res.status(400);
      res.send(
        JSON.stringify({
          status: 400,
          error: "Yorum bulunamadı.",
          data: null,
        })
      );
    }

    if (commentExist?.customerId !== data.user?.user.id) {
      res.status(401);
      res.send(
        JSON.stringify({
          status: 401,
          error: "Kullanıcıya ait yorum bulunamadı.",
          data: null,
        })
      );
      return;
    }

    const comment = await prisma.comment.update({
      where: { id: id },
      data: { text, rate },
    });
    res.send(JSON.stringify({ status: 200, error: null, data: comment.id }));
  } catch (error) {
    res.status(404);
    res.send(JSON.stringify({ status: 404, error: error, data: null }));
  }
});

router.post(`/delete`, async (req, res) => {
  const { id } = req.body;

  const data = await getUserId(req);

  if (data === null || data.message || data?.user?.user.role === "WARLOCK") {
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
    const commentExist = await prisma.comment.findFirst({
      where: {
        id: id,
      },
    });

    if (!commentExist) {
      res.status(400);
      res.send(
        JSON.stringify({
          status: 400,
          error: "Yorum bulunamadı.",
          data: null,
        })
      );
    }

    if (commentExist?.customerId !== data.user?.user.id) {
      res.status(401);
      res.send(
        JSON.stringify({
          status: 401,
          error: "Kullanıcıya ait yorum bulunamadı.",
          data: null,
        })
      );
      return;
    }
    const comment = await prisma.comment.delete({
      where: {
        id: id,
      },
    });
    res.send(JSON.stringify({ status: 200, error: null, data: comment.id }));
  } catch (error) {
    res.status(404);
    res.send(JSON.stringify({ status: 404, error: error, data: null }));
  }
});

module.exports = router;

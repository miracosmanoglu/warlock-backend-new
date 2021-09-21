import { PrismaClient } from "@prisma/client";
import express from "express";
import { getUserId } from "../utils/authentication";
const prisma = new PrismaClient();
const router = express.Router();

router.get("/all", async (req, res) => {
  try {
    const dates = await prisma.date.findMany({});
    res.send(JSON.stringify({ status: 200, error: null, data: dates }));
  } catch (e) {
    res.status(500);
    res.send(JSON.stringify({ status: 500, error: e, data: null }));
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const date = await prisma.date.findUnique({
      where: { id: parseInt(id) },
    });

    if (!date) {
      res.status(404);
      res.send(
        JSON.stringify({
          status: 404,
          error: "date not found",
          data: null,
        })
      );
      return;
    }

    res.send(JSON.stringify({ status: 200, error: null, data: date }));
    return;
  } catch (error) {
    res.status(404);
    res.send(JSON.stringify({ status: 404, error: error, data: null }));
    return;
  }
});

router.post("/", async (req, res) => {
  const data = await getUserId(req);

  if (
    data === null ||
    data.message ||
    data?.user?.user.role === "ADMIN" ||
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

  const gig = await prisma.gig.findUnique({
    where: { id: parseInt(req.body.gigId) },
  });

  if (!gig) {
    res.status(404);
    res.send(
      JSON.stringify({
        status: 404,
        error: "gig not found",
        data: null,
      })
    );
    return;
  }

  const customer = await prisma.customer.findUnique({
    where: { id: data?.user?.user.id },
  });

  if (!customer) {
    res.status(404);
    res.send(
      JSON.stringify({
        status: 404,
        error: "customer not found",
        data: null,
      })
    );
    return;
  }

  if (gig.price > customer?.credit) {
    res.status(404);
    res.send(
      JSON.stringify({
        status: 404,
        error: "customer credit is not enough for this gig",
        data: null,
      })
    );
    return;
  }

  try {
    const newDate = await prisma.date.create({
      data: {
        gigId: req.body.gigId,
        warlockId: req.body.warlockId,
        customerId: req.body.customerId,
        credit: gig.price,
        description: req.body.description,
      },
    });
    res.send(JSON.stringify({ status: 200, error: null, data: newDate.id }));
    return;
  } catch (error) {
    res.status(500);
    res.send(JSON.stringify({ status: 500, error: error, token: null }));
  }
});

router.post("/verify", async (req, res) => {
  const data = await getUserId(req);

  if (
    data === null ||
    data.message ||
    data?.user?.user.role === "ADMIN" ||
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

  const dateExist = await prisma.date.findFirst({
    where: {
      id: req.body.id,
    },
  });

  if (!dateExist) {
    res.status(400);
    res.send(
      JSON.stringify({
        status: 400,
        error: "date does not exist",
        data: null,
      })
    );
    return;
  }

  if (dateExist.warlockId !== data.user?.user.id) {
    res.status(401);
    res.send(
      JSON.stringify({
        status: 401,
        error: "Warlock does not own this date.",
        data: null,
      })
    );
    return;
  }

  try {
    const newDate = await prisma.date.update({
      where: { id: req.body.id },
      data: {
        verified: req.body.verified,
      },
    });
    const customer = await prisma.customer.update({
      where: { id: dateExist.customerId },
      data: {
        credit: {
          decrement: newDate.credit,
        },
      },
    });
    res.send(JSON.stringify({ status: 200, error: null, data: newDate.id }));
    return;
  } catch (error) {
    res.status(500);
    res.send(JSON.stringify({ status: 500, error: error, token: null }));
  }
});
module.exports = router;

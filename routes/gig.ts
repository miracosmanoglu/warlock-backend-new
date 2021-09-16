import { PrismaClient } from "@prisma/client";
import express from "express";
import { getUserId } from "../utils/authentication";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/:warlockid/:categoryid", async (req, res) => {
  const { warlockid, categoryid } = req.params;

  try {
    const filteredGigs = await prisma.gig.findMany({
      where: {
        AND: [
          {
            categoryId: categoryid === "all" ? undefined : parseInt(categoryid),
          },
          {
            warlockId: warlockid === "all" ? undefined : parseInt(warlockid),
          },
        ],
      },
    });
    res.send(
      JSON.stringify({
        status: 200,
        error: null,
        data: filteredGigs,
      })
    );
  } catch (error) {
    res.status(404);
    res.send(
      JSON.stringify({
        status: 404,
        error: error,
        data: null,
      })
    );
  }
});

router.post("/", async (req, res) => {
  const { description, price, title, duration, categoryId } = req.body;

  const data = await getUserId(req);

  if (
    data === null ||
    data.message ||
    data?.user?.user.role === "CUSTOMER" ||
    data?.user?.user.role === "ADMIN"
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
  if (!data.user?.user.verified) {
    res.status(401);
    res.send(
      JSON.stringify({
        status: 401,
        error: "Warlock is not verified",
        data: null,
      })
    );
    return;
  }
  try {
    if (data.user) {
      const result = await prisma.gig.create({
        data: {
          description,
          price,
          title,
          duration,
          warlockId: data.user.user.id,
          categoryId,
        },
      });

      res.send(JSON.stringify({ status: 200, error: null, data: result }));
    }
  } catch (e) {
    res.status(500);
    res.send(JSON.stringify({ status: 500, error: e, data: null }));
  }
});

router.put("/", async (req, res) => {
  const { description, price, title, duration, id } = req.body;

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
  if (!data.user?.user.verified) {
    res.status(401);
    res.send(
      JSON.stringify({
        status: 401,
        error: "Warlock is not verified",
        data: null,
      })
    );
    return;
  }
  try {
    const gigExist = await prisma.gig.findFirst({
      where: {
        id: id,
      },
    });

    if (!gigExist) {
      res.status(400);
      res.send(
        JSON.stringify({
          status: 400,
          error: "gig does not exist",
          data: null,
        })
      );
      return;
    }

    if (gigExist?.warlockId !== data.user?.user.id) {
      res.status(401);
      res.send(
        JSON.stringify({
          status: 401,
          error: "Warlock does not own this gig.",
          data: null,
        })
      );
      return;
    }

    const gig = await prisma.gig.update({
      where: { id: id },
      data: { description, price, title, duration },
    });
    res.send(JSON.stringify({ status: 200, error: null, data: gig.id }));
  } catch (error) {
    res.status(404);
    res.send(JSON.stringify({ status: 404, error: error, data: null }));
  }
});

router.post(`/delete`, async (req, res) => {
  const { id } = req.body;

  const data = await getUserId(req);

  if (
    data === null ||
    data.message ||
    data?.user?.user.role === "CUSTOMER" ||
    data?.user?.user.role === "ADMIN"
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
  if (!data.user?.user.verified) {
    res.status(401);
    res.send(
      JSON.stringify({
        status: 401,
        error: "Warlock is not verified",
        data: null,
      })
    );
    return;
  }
  try {
    const gigExist = await prisma.gig.findFirst({
      where: {
        id: id,
      },
    });

    if (!gigExist) {
      res.status(400);
      res.send(
        JSON.stringify({
          status: 400,
          error: "Gig does not exist",
          data: null,
        })
      );
    }
    const gig = await prisma.gig.delete({
      where: {
        id: id,
      },
    });
    res.send(JSON.stringify({ status: 200, error: null, data: gig.id }));
  } catch (error) {
    res.status(404);
    res.send(JSON.stringify({ status: 404, error: error, data: null }));
  }
});
module.exports = router;

import { PrismaClient } from "@prisma/client";
import express from "express";
import { getUserId } from "../utils/authentication";
const prisma = new PrismaClient();
const router = express.Router();

router.get("/:warlockid/:customerid/:dateid", async (req, res) => {
  const { warlockid, customerid, dateid } = req.params;

  try {
    const filteredDates = await prisma.dates.findMany({
      where: {
        AND: [
          {
            customerId: customerid === "all" ? undefined : parseInt(customerid),
          },
          {
            warlockId: warlockid === "all" ? undefined : parseInt(warlockid),
          },
          {
            id: dateid === "all" ? undefined : parseInt(dateid),
          },
        ],
      },
      include: {
        Gig: { include: { category: true } },
        Warlock: true,
        Customer: true,
      },
    });
    res.send(
      JSON.stringify({
        status: 200,
        error: null,
        data: filteredDates,
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
        error:
          "Kullanıcı bu işlem için uygun değil. Lütfen danışan hesabı ile giriş yapın.",
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
        error: "İstenilen ilan bulunamadı.",
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
        error: "İstenilen kullanıcı bulunamadı",
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
        error: "Danışan kredisi bu işlem için yeterli değil.",
        data: null,
      })
    );
    return;
  }

  try {
    const newDate = await prisma.dates.create({
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
        error:
          "Kullanıcı bu işlem için uygun değil. Lütfen başka bir hesap ile giriş yapın.",
        data: null,
      })
    );
    return;
  }

  const dateExist = await prisma.dates.findFirst({
    where: {
      id: req.body.id,
    },
  });

  if (!dateExist) {
    res.status(400);
    res.send(
      JSON.stringify({
        status: 400,
        error: "Randevu bulunamadı.",
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
        error: "Danışmanın böyle bir randevusu yok.",
        data: null,
      })
    );
    return;
  }

  try {
    const newDate = await prisma.dates.update({
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

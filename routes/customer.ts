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
  try {
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        surname: true,
        phone: true,
        role: true,
      },
    });
    res.send(JSON.stringify({ status: 200, error: null, data: customers }));
  } catch (e) {
    res.status(500);
    res.send(JSON.stringify({ status: 500, error: e, data: null }));
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const data = await getUserId(req);

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(id) || data?.user?.user.id },
    });

    if (!customer) {
      res.status(404);
      res.send(
        JSON.stringify({
          status: 404,
          error: "Danışan bulunamadı.",
          data: null,
        })
      );
      return;
    }

    res.send(JSON.stringify({ status: 200, error: null, data: customer }));
    return;
  } catch (error) {
    res.status(404);
    res.send(JSON.stringify({ status: 404, error: error, data: null }));
    return;
  }
});

router.post("/register", async (req, res) => {
  const { email, username, name, surname, phone, identity } = req.body;

  try {
    const emailExist = await prisma.customer.findMany({
      where: { email: email },
    });
    if (emailExist.length != 0) {
      res.status(302);
      res.send(
        JSON.stringify({
          status: 302,
          error: "Bu email ile kullanıcı mevcut.",
          data: null,
        })
      );
      return;
    }
    const usernameExist = await prisma.customer.findMany({
      where: { username: username },
    });
    if (usernameExist.length != 0) {
      res.status(302);
      res.send(
        JSON.stringify({
          status: 302,
          error: "Bu kullanıcı adı ile kullanıcı mevcut.",
          data: null,
        })
      );
      return;
    }
    const phoneExist = await prisma.customer.findMany({
      where: { phone: phone },
    });
    if (phoneExist.length != 0) {
      res.status(302);
      res.send(
        JSON.stringify({
          status: 302,
          error: "Bu telefon ile kullanıcı mevcut.",
          data: null,
        })
      );
      return;
    }
    const identityExist = await prisma.customer.findMany({
      where: { identity: identity },
    });
    if (usernameExist.length != 0) {
      res.status(302);
      res.send(
        JSON.stringify({
          status: 302,
          error: "Bu kullanıcı adı ile kullanıcı mevcut.",
          data: null,
        })
      );
      return;
    }
    req.body.password = await bcrypt.hash(req.body.password, 12);
    try {
      const customer = await prisma.customer.create({
        data: {
          username,
          name,
          surname,
          phone,
          email,
          identity,
          password: req.body.password,
        },
      });
      res.send(JSON.stringify({ status: 200, error: null, data: customer.id }));
      return;
    } catch (e) {
      res.status(500);
      res.send(
        JSON.stringify({
          status: 500,
          error: e,
          data: null,
        })
      );
      return;
    }
  } catch (e) {
    res.status(500);
    res.send(JSON.stringify({ status: 500, error: e, data: null }));
    return;
  }
});

router.post("/login", async function login(req, res) {
  const { email } = req.body;

  try {
    const customer = await prisma.customer.findMany({
      where: { email },
    });
    if (customer.length === 0) {
      res.status(404);
      res.send(
        JSON.stringify({
          status: 404,
          error: "Email'e sahip kullanıcı bulunamadı.",
          token: null,
        })
      );
      return;
    }
    const valid = await bcrypt.compare(req.body.password, customer[0].password);
    if (!valid) {
      res.status(404);
      res.send(
        JSON.stringify({
          status: 404,
          error: "Yanlış şifre.",
          token: null,
        })
      );
      return;
    }
    // verify: needs SECRET | use for authentication
    // decode: no secret | use for client side
    const token = jwt.sign(
      {
        user: lodash.pick(customer[0], ["id", "email", "role"]),
      },
      SECRET,
      {
        expiresIn: "2 days",
      }
    );
    res.send(
      JSON.stringify({
        status: 200,
        error: null,
        token: token,
        data: customer,
      })
    );
  } catch (error) {
    res.status(500);
    res.send(JSON.stringify({ status: 500, error: error, token: null }));
  }
});

router.put("/reset-password", async (req, res) => {
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
          "Kullanıcı bu işlem için uygun değil. Lütfen başka bir hesap ile giriş yapın.",
        data: null,
      })
    );
    return;
  }
  try {
    const customerExist = await prisma.customer.findFirst({
      where: {
        id: data.user?.user.id,
      },
    });

    if (!customerExist) {
      res.status(400);
      res.send(
        JSON.stringify({
          status: 400,
          error: "Danışan bulunamadı.",
          data: null,
        })
      );
      return;
    }

    if (req.body.password !== req.body.rePassword) {
      res.status(500);
      res.send(
        JSON.stringify({
          status: 500,
          error: "Şifreler uyuşmuyor. Kontrol ediniz.",
          data: null,
        })
      );
      return;
    }
    req.body.password = await bcrypt.hash(req.body.password, 12);

    const customer = await prisma.customer.update({
      where: { id: data.user?.user.id },
      data: { password: req.body.password },
    });
    res.send(JSON.stringify({ status: 200, error: null, data: customer.id }));
    return;
  } catch (error) {
    res.status(404);
    res.send(JSON.stringify({ status: 404, error: error, data: null }));
    return;
  }
});

module.exports = router;

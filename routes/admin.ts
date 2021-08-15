import { PrismaClient } from "@prisma/client";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import lodash from "lodash";

const SECRET = "asbadbbdbbh7788888887hb113h3hbb";
const prisma = new PrismaClient();
const router = express.Router();

router.get("/", async (req, res) => {
  const { id } = req.body;
  const filteredAdmin = await prisma.admin.findUnique({
    where: {
      id: id,
    },
  });
  res.json(filteredAdmin);
});

router.post("/register", async (req, res) => {
  const { email, username, name, surname, phone, password, about, image } =
    req.body;

  try {
    const emailExist = await prisma.admin.findMany({
      where: { email: email },
    });
    if (emailExist.length != 0) {
      res.send(
        JSON.stringify({
          status: 302,
          error: "admin is found with that email",
        })
      );
      return;
    }
    const usernameExist = await prisma.admin.findMany({
      where: { username: username },
    });
    if (usernameExist.length != 0) {
      res.send(
        JSON.stringify({
          status: 302,
          error: "admin is found with that username",
        })
      );
      return;
    }
    const phoneExist = await prisma.admin.findMany({
      where: { phone: phone },
    });
    if (phoneExist.length != 0) {
      res.send(
        JSON.stringify({
          status: 302,
          error: "admin is found with that phone",
        })
      );
      return;
    }
    req.body.password = await bcrypt.hash(req.body.password, 12);
    try {
      const admin = await prisma.admin.create({
        data: {
          email,
          username,
          name,
          surname,
          phone,
          password: req.body.password,
          about,
          image,
        },
      });
      res.send(
        JSON.stringify({ status: 200, error: null, response: admin.id })
      );
    } catch (e) {
      res.send(
        JSON.stringify({
          status: 500,
          error: "In create admin " + e,
          response: null,
        })
      );
    }
  } catch (e) {
    res.send(
      JSON.stringify({ status: 500, error: "In admin " + e, response: null })
    );
  }
});

router.post("/login", async function login(req, res) {
  const { email } = req.body;

  const admin = await prisma.admin.findMany({
    where: { email },
  });
  if (admin.length === 0) {
    res.send(
      JSON.stringify({
        status: 404,
        error: "Not admin with that email",
        token: null,
      })
    );
    return;
  }
  const valid = await bcrypt.compare(req.body.password, admin[0].password);
  if (!valid) {
    res.send(
      JSON.stringify({ status: 404, error: "Incorrect password", token: null })
    );
    return;
  }
  // verify: needs SECRET | use for authentication
  // decode: no secret | use for client side
  const token = jwt.sign(
    {
      user: lodash.pick(admin[0], ["id", "email", "role"]),
    },
    SECRET,
    {
      expiresIn: "2 days",
    }
  );
  res.send(JSON.stringify({ status: 200, error: null, token: token }));
});
module.exports = router;

import { PrismaClient } from "@prisma/client";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import lodash from "lodash";

const SECRET = "asbadbbdbbh7788888887hb113h3hbb";
const prisma = new PrismaClient();
const router = express.Router();

router.get("/all", async (req, res) => {
  const warlocks = await prisma.warlock.findMany({});
  res.json(warlocks);
});

router.post("/register", async (req, res) => {
  const {
    email,
    username,
    name,
    surname,
    phone,
    about,
    rating,
    tags,
    comments,
    status,
  } = req.body;

  try {
    const emailExist = await prisma.warlock.findMany({
      where: { email: email },
    });
    console.log("warlock: ", emailExist);
    if (emailExist.length != 0) {
      res.send(
        JSON.stringify({
          status: 302,
          error: "warlock is found with that email",
        })
      );
      return;
    }
    const usernameExist = await prisma.warlock.findMany({
      where: { username: username },
    });
    console.log("warlock: ", usernameExist);
    if (usernameExist.length != 0) {
      res.send(
        JSON.stringify({
          status: 302,
          error: "warlock is found with that username",
        })
      );
      return;
    }
    const phoneExist = await prisma.warlock.findMany({
      where: { phone: phone },
    });
    console.log("warlock: ", phoneExist);
    if (phoneExist.length != 0) {
      res.send(
        JSON.stringify({
          status: 302,
          error: "warlock is found with that phone",
        })
      );
      return;
    }
    req.body.password = await bcrypt.hash(req.body.password, 12);
    try {
      console.log("password: ", req.body.password);
      const warlock = await prisma.warlock.create({
        data: {
          email,
          username,
          name,
          surname,
          phone,
          password: req.body.password,
          about,
          rating,
          tags,
          comments,
          status,
        },
      });
      res.send(
        JSON.stringify({ status: 200, error: null, response: warlock.id })
      );
    } catch (e) {
      res.send(
        JSON.stringify({
          status: 500,
          error: "In create warlock " + e,
          response: null,
        })
      );
    }
  } catch (e) {
    res.send(
      JSON.stringify({ status: 500, error: "In warlock " + e, response: null })
    );
  }
});

router.post("/login", async function login(req, res) {
  const { email } = req.body;

  const warlock = await prisma.warlock.findMany({
    where: { email },
  });
  if (warlock.length === 0) {
    res.send(
      JSON.stringify({
        status: 404,
        error: "Not warlock with that email",
        token: null,
      })
    );
    return;
  }
  const valid = await bcrypt.compare(req.body.password, warlock[0].password);
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
      warlock: lodash.pick(warlock[0], ["id", "email"]),
    },
    SECRET,
    {
      expiresIn: "2 days",
    }
  );
  res.send(JSON.stringify({ status: 200, error: null, token: token }));
});

module.exports = router;

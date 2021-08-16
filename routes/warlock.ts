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
    const warlocks = await prisma.warlock.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        surname: true,
        phone: true,
        role: true,
        about: true,
        rating: true,
        tags: true,
        comments: true,
        status: true,
      },
    });
    res.send(JSON.stringify({ status: 200, error: null, data: warlocks }));
  } catch (e) {
    res.status(500);
    res.send(JSON.stringify({ status: 500, error: e, data: null }));
  }
});

router.get("/", async (req, res) => {
  const { id } = req.body;
  const data = await getUserId(req);

  try {
    const warlock = await prisma.warlock.findUnique({
      where: { id: id || data?.user?.user.id },
    });
    res.send(JSON.stringify({ status: 200, error: null, data: warlock }));
  } catch (error) {
    res.status(404);
    res.send(
      JSON.stringify({ status: 404, error: "Warlock not found", data: null })
    );
  }
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
    if (emailExist.length != 0) {
      res.status(302);
      res.send(
        JSON.stringify({
          status: 302,
          error: "warlock is found with that email",
          data: null,
        })
      );
      return;
    }
    const usernameExist = await prisma.warlock.findMany({
      where: { username: username },
    });
    if (usernameExist.length != 0) {
      res.status(302);
      res.send(
        JSON.stringify({
          status: 302,
          error: "warlock is found with that username",
          data: null,
        })
      );
      return;
    }
    const phoneExist = await prisma.warlock.findMany({
      where: { phone: phone },
    });
    if (phoneExist.length != 0) {
      res.status(302);
      res.send(
        JSON.stringify({
          status: 302,
          error: "warlock is found with that phone",
          data: null,
        })
      );
      return;
    }
    req.body.password = await bcrypt.hash(req.body.password, 12);
    try {
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
      res.send(JSON.stringify({ status: 200, error: null, data: warlock.id }));
    } catch (e) {
      res.status(500);
      res.send(
        JSON.stringify({
          status: 500,
          error: e,
          data: null,
        })
      );
    }
  } catch (e) {
    res.status(500);
    res.send(JSON.stringify({ status: 500, error: e, data: null }));
  }
});

router.post("/login", async function login(req, res) {
  const { email } = req.body;

  try {
    const warlock = await prisma.warlock.findMany({
      where: { email },
    });
    if (warlock.length === 0) {
      res.status(404);
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
      res.status(404);
      res.send(
        JSON.stringify({
          status: 404,
          error: "Incorrect password",
          token: null,
        })
      );
      return;
    }
    // verify: needs SECRET | use for authentication
    // decode: no secret | use for client side
    const token = jwt.sign(
      {
        user: lodash.pick(warlock[0], ["id", "email", "role"]),
      },
      SECRET,
      {
        expiresIn: "2 days",
      }
    );
    res.send(JSON.stringify({ status: 200, error: null, token: token }));
  } catch (error) {
    res.status(500);
    res.send(
      JSON.stringify({
        status: 500,
        error: error,
        token: null,
      })
    );
  }
});

module.exports = router;

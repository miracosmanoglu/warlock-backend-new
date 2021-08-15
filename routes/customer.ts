import { PrismaClient } from "@prisma/client";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import lodash from "lodash";

const SECRET = "asbadbbdbbh7788888887hb113h3hbb";
const prisma = new PrismaClient();
const router = express.Router();

router.get("/all", async (req, res) => {
  const customers = await prisma.customer.findMany({});
  res.json(customers);
});

router.post("/register", async (req, res) => {
  const { email, username, name, surname, phone } = req.body;

  try {
    const emailExist = await prisma.customer.findMany({
      where: { email: email },
    });
    if (emailExist.length != 0) {
      res.send(
        JSON.stringify({
          status: 302,
          error: "Customer is found with that email",
        })
      );
      return;
    }
    const usernameExist = await prisma.customer.findMany({
      where: { username: username },
    });
    if (usernameExist.length != 0) {
      res.send(
        JSON.stringify({
          status: 302,
          error: "Customer is found with that username",
        })
      );
      return;
    }
    const phoneExist = await prisma.customer.findMany({
      where: { phone: phone },
    });
    if (phoneExist.length != 0) {
      res.send(
        JSON.stringify({
          status: 302,
          error: "Customer is found with that phone",
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
          password: req.body.password,
        },
      });
      res.send(
        JSON.stringify({ status: 200, error: null, response: customer.id })
      );
    } catch (e) {
      res.send(
        JSON.stringify({
          status: 500,
          error: "In create customer " + e,
          response: null,
        })
      );
    }
  } catch (e) {
    res.send(
      JSON.stringify({ status: 500, error: "In customer " + e, response: null })
    );
  }
});

router.post("/login", async function login(req, res) {
  const { email } = req.body;

  const customer = await prisma.customer.findMany({
    where: { email },
  });
  if (customer.length === 0) {
    res.send(
      JSON.stringify({
        status: 404,
        error: "Not customer with that email",
        token: null,
      })
    );
    return;
  }
  const valid = await bcrypt.compare(req.body.password, customer[0].password);
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
      user: lodash.pick(customer[0], ["id", "email", "role"]),
    },
    SECRET,
    {
      expiresIn: "2 days",
    }
  );
  res.send(JSON.stringify({ status: 200, error: null, token: token }));
});

module.exports = router;

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
    return;
  } catch (e) {
    res.status(500);
    res.send(JSON.stringify({ status: 500, error: e, data: null }));
    return;
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const data = await getUserId(req);

  try {
    const warlock = await prisma.warlock.findUnique({
      where: { id: parseInt(id) || data?.user?.user.id },
      include: { Gig: { include: { Comment: true } } },
    });

    if (!warlock) {
      res.status(404);
      res.send(
        JSON.stringify({
          status: 404,
          error: "warlock not found",
          data: null,
        })
      );
      return;
    }

    res.send(JSON.stringify({ status: 200, error: null, data: warlock }));
    return;
  } catch (error) {
    res.status(404);
    res.send(JSON.stringify({ status: 404, error: error, data: null }));
    return;
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
    return;
  } catch (error) {
    res.status(500);
    res.send(
      JSON.stringify({
        status: 500,
        error: error,
        token: null,
      })
    );
    return;
  }
});

router.put("/reset-password", async (req, res) => {
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
  try {
    const warlockExist = await prisma.warlock.findFirst({
      where: {
        id: data.user?.user.id,
      },
    });

    if (!warlockExist) {
      res.status(400);
      res.send(
        JSON.stringify({
          status: 400,
          error: "warlock does not exist",
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
          error: "Password does not match.",
          data: null,
        })
      );
      return;
    }
    req.body.password = await bcrypt.hash(req.body.password, 12);

    const warlock = await prisma.warlock.update({
      where: { id: data.user?.user.id },
      data: { password: req.body.password },
    });
    res.send(JSON.stringify({ status: 200, error: null, data: warlock.id }));
    return;
  } catch (error) {
    res.status(404);
    res.send(JSON.stringify({ status: 404, error: error, data: null }));
    return;
  }
});

router.put("/tag", async (req, res) => {
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
  try {
    const warlockExist = await prisma.warlock.findFirst({
      where: {
        id: data.user?.user.id,
      },
    });

    if (!warlockExist) {
      res.status(400);
      res.send(
        JSON.stringify({
          status: 400,
          error: "warlock does not exist",
          data: null,
        })
      );
      return;
    }

    const warlock = await prisma.warlock.update({
      where: { id: data.user?.user.id },
      data: { tags: req.body.tags },
    });
    res.send(JSON.stringify({ status: 200, error: null, data: warlock.id }));
    return;
  } catch (error) {
    res.status(404);
    res.send(JSON.stringify({ status: 404, error: error, data: null }));
    return;
  }
});

router.put("/status", async (req, res) => {
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
  try {
    const warlockExist = await prisma.warlock.findFirst({
      where: {
        id: data.user?.user.id,
      },
    });

    if (!warlockExist) {
      res.status(400);
      res.send(
        JSON.stringify({
          status: 400,
          error: "warlock does not exist",
          data: null,
        })
      );
      return;
    }

    const warlock = await prisma.warlock.update({
      where: { id: data.user?.user.id },
      data: { status: req.body.status },
    });
    res.send(JSON.stringify({ status: 200, error: null, data: warlock.id }));
    return;
  } catch (error) {
    res.status(404);
    res.send(JSON.stringify({ status: 404, error: error, data: null }));
    return;
  }
});

router.put("/about", async (req, res) => {
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
  try {
    const warlockExist = await prisma.warlock.findFirst({
      where: {
        id: data.user?.user.id,
      },
    });

    if (!warlockExist) {
      res.status(400);
      res.send(
        JSON.stringify({
          status: 400,
          error: "warlock does not exist",
          data: null,
        })
      );
      return;
    }

    const warlock = await prisma.warlock.update({
      where: { id: data.user?.user.id },
      data: { about: req.body.about },
    });
    res.send(JSON.stringify({ status: 200, error: null, data: warlock.id }));
    return;
  } catch (error) {
    res.status(404);
    res.send(JSON.stringify({ status: 404, error: error, data: null }));
    return;
  }
});

module.exports = router;

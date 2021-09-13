import { PrismaClient } from "@prisma/client";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import lodash from "lodash";
import { getUserId } from "../utils/authentication";

const SECRET = "asbadbbdbbh7788888887hb113h3hbb";
const prisma = new PrismaClient();
const router = express.Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const data = await getUserId(req);

  try {
    const admin = await prisma.admin.findUnique({
      where: { id: parseInt(id) || data?.user?.user.id },
      include: {
        Blog: true,
      },
    });

    if (!admin) {
      res.status(404);
      res.send(
        JSON.stringify({
          status: 404,
          error: "admin not found",
          data: null,
        })
      );
      return;
    }

    res.send(JSON.stringify({ status: 200, error: null, data: admin }));
    return;
  } catch (error) {
    res.status(404);
    res.send(JSON.stringify({ status: 404, error: error, data: null }));
    return;
  }
});

router.post("/register", async (req, res) => {
  const { email, username, name, surname, phone, about, image } = req.body;

  try {
    const emailExist = await prisma.admin.findMany({
      where: { email: email },
    });
    if (emailExist.length != 0) {
      res.status(302);
      res.send(
        JSON.stringify({
          status: 302,
          error: "admin is found with that email",
          data: null,
        })
      );
      return;
    }
    const usernameExist = await prisma.admin.findMany({
      where: { username: username },
    });
    if (usernameExist.length != 0) {
      res.status(302);
      res.send(
        JSON.stringify({
          status: 302,
          error: "admin is found with that username",
          data: null,
        })
      );
      return;
    }
    const phoneExist = await prisma.admin.findMany({
      where: { phone: phone },
    });
    if (phoneExist.length != 0) {
      res.status(302);
      res.send(
        JSON.stringify({
          status: 302,
          error: "admin is found with that phone",
          data: null,
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
      res.send(JSON.stringify({ status: 200, error: null, data: admin.id }));
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

  const admin = await prisma.admin.findMany({
    where: { email },
  });
  if (admin.length === 0) {
    res.status(404);
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
    res.status(404);
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
  res.send(
    JSON.stringify({ status: 200, error: null, token: token, data: admin })
  );
});

router.put("/reset-password", async (req, res) => {
  const data = await getUserId(req);

  if (
    data === null ||
    data.message ||
    data?.user?.user.role === "CUSTOMER" ||
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
  try {
    const adminExist = await prisma.admin.findFirst({
      where: {
        id: data.user?.user.id,
      },
    });

    if (!adminExist) {
      res.status(400);
      res.send(
        JSON.stringify({
          status: 400,
          error: "admin does not exist",
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

    const admin = await prisma.admin.update({
      where: { id: data.user?.user.id },
      data: { password: req.body.password },
    });
    res.send(JSON.stringify({ status: 200, error: null, data: admin.id }));
    return;
  } catch (error) {
    res.status(404);
    res.send(JSON.stringify({ status: 404, error: error, data: null }));
    return;
  }
});

router.put("/image", async (req, res) => {
  const data = await getUserId(req);

  if (
    data === null ||
    data.message ||
    data?.user?.user.role === "WARLOCK" ||
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
    const adminExist = await prisma.admin.findFirst({
      where: {
        id: data.user?.user.id,
      },
    });

    if (!adminExist) {
      res.status(400);
      res.send(
        JSON.stringify({
          status: 400,
          error: "admin does not exist",
          data: null,
        })
      );
      return;
    }

    const admin = await prisma.admin.update({
      where: { id: data.user?.user.id },
      data: { image: req.body.image },
    });

    res.send(JSON.stringify({ status: 200, error: null, data: null }));
    return;
  } catch (error) {
    res.status(404);
    res.send(JSON.stringify({ status: 404, error: error, data: null }));
    return;
  }
});

router.put("/verified", async (req, res) => {
  const data = await getUserId(req);
  const { id } = req.body;

  if (
    data === null ||
    data.message ||
    data?.user?.user.role === "WARLOCK" ||
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
        id: id,
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
      where: { id: id },
      data: { verified: req.body.verified },
    });
    res.send(JSON.stringify({ status: 200, error: null, data: warlock.id }));
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
    data?.user?.user.role === "WARLOCK" ||
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
    const warlockExist = await prisma.warlock.findUnique({
      where: {
        id: req.body.id,
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

    const deletedComments = await prisma.comment.deleteMany({
      where: { gig: { warlockId: req.body.id } },
    });

    const deletedGigs = await prisma.gig.deleteMany({
      where: { warlockId: req.body.id },
    });

    const warlock = await prisma.warlock.delete({
      where: { id: req.body.id },
    });

    res.send(
      JSON.stringify({
        status: 200,
        error: null,
        data: { deletedComments, deletedGigs, warlock },
      })
    );
    return;
  } catch (error) {
    res.status(404);
    res.send(JSON.stringify({ status: 404, error: error, data: null }));
    return;
  }
});

module.exports = router;

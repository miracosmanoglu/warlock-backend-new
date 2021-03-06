import { Prisma, PrismaClient } from "@prisma/client";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import lodash from "lodash";
import { getUserId } from "../utils/authentication";
import nodemailer from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";
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
        verified: true,
        image: true,
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
          error: "Danışman bulunamadı.",
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
    verified,
    image,
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
          error: "Bu email ile kullanıcı mevcut.",
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
          error: "Bu kullanıcı adı ile kullanıcı mevcut.",
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
          error: "Bu telefon ile kullanıcı mevcut.",
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
          verified,
          image,
        },
      });
      res.send(JSON.stringify({ status: 200, error: null, data: warlock.id }));
      return;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
        console.log(e.code);
      }
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
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      console.log(e.code);
    }
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
          error: "Email'e sahip kullanıcı bulunamadı.",
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
        user: lodash.pick(warlock[0], ["id", "email", "role", "verified"]),
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
        data: warlock,
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
          error: "Danışman bulunamadı.",
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
        error:
          "Kullanıcı bu işlem için uygun değil. Lütfen başka bir hesap ile giriş yapın.",
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
          error: "Danışman bulunamadı.",
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
        error:
          "Kullanıcı bu işlem için uygun değil. Lütfen başka bir hesap ile giriş yapın.",
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
          error: "Danışman bulunamadı.",
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
        error:
          "Kullanıcı bu işlem için uygun değil. Lütfen başka bir hesap ile giriş yapın.",
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
          error: "Danışman bulunamadı.",
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

router.put("/image", async (req, res) => {
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
          error: "Danışman bulunamadı.",
          data: null,
        })
      );
      return;
    }

    const warlock = await prisma.warlock.update({
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

router.post("/career", async (req, res) => {
  try {
    const warlockExist = await prisma.warlock.findFirst({
      where: {
        email: req.body.email,
      },
    });

    if (!warlockExist) {
      res.status(400);
      res.send(
        JSON.stringify({
          status: 400,
          error: "Danışman bulunamadı.",
          data: null,
        })
      );
      return;
    }

    const transporter = nodemailer.createTransport(
      smtpTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        auth: {
          user: "furkanmailsender@gmail.com",
          pass: "12323434f",
        },
      })
    );

    const mailData = {
      from: "furkanmailsender@gmail.com", // sender address
      to: "mrccc23@gmail.com", // list of receivers
      subject: "Sending Email using Node.js",
      text: `${req.body.name} ${req.body.surname} ${req.body.email} ${req.body.text}`,
    };
    //send email
    transporter.sendMail(mailData, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
      }
    });

    res.send(JSON.stringify({ status: 200, error: null, data: mailData }));
    return;
  } catch (error) {
    res.status(404);
    res.send(JSON.stringify({ status: 404, error: error, data: null }));
    return;
  }
});
module.exports = router;

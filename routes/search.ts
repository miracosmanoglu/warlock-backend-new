import { PrismaClient } from "@prisma/client";
import express from "express";
import { getUserId } from "../utils/authentication";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const filteredGigs = await prisma.gig.findMany({
      where: {
        title: {
          contains: req.body.text,
        },
      },
      select: {
        title: true,
        warlockId: true,
      },
      orderBy: {
        title: "asc",
      },
    });

    filteredGigs.map((item, index) => {
      let link = { link: `/uzmanlar/${item.warlockId}` };
      filteredGigs[index] = { ...item, ...link };
    });

    const filteredWarlocks = await prisma.warlock.findMany({
      where: {
        username: {
          contains: req.body.text,
        },
      },
      select: {
        username: true,
        id: true,
      },
      orderBy: {
        username: "asc",
      },
    });

    filteredWarlocks.map((item, index) => {
      let link = { link: `/uzmanlar/${item.id}` };
      filteredWarlocks[index] = { ...item, ...link };
    });

    const filteredBlogs = await prisma.blog.findMany({
      where: {
        title: {
          contains: req.body.text,
        },
      },
      select: {
        title: true,
        id: true,
      },
      orderBy: {
        title: "asc",
      },
    });

    filteredBlogs.map((item, index) => {
      let link = { link: `/blog/${item.id}` };
      filteredBlogs[index] = { ...item, ...link };
    });

    const filteredHoroscopes = await prisma.horoscope.findMany({
      where: {
        name: { contains: req.body.text },
      },
      select: {
        name: true,
        id: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    filteredHoroscopes.map((item, index) => {
      let link = { link: `/burcdetay/${item.id}` };
      filteredHoroscopes[index] = { ...item, ...link };
    });

    res.send(
      JSON.stringify({
        status: 200,
        error: null,
        data: {
          gigs: filteredGigs,
          warlocks: filteredWarlocks,
          blogs: filteredBlogs,
          horoscopes: filteredHoroscopes,
        },
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

module.exports = router;

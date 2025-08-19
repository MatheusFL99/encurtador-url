import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import shortid from "shortid";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const mongoUrl = process.env.MONGO_URI;

if (!mongoUrl) {
  throw new Error("MONGO_URI environment variable is not defined");
}

mongoose.connect(mongoUrl);
console.log("Connected to MongoDB");

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortUrl: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  clicks: {
    type: Number,
    default: 0,
  },
});

const Url = mongoose.model("Url", urlSchema);

app.post("/api/shorten", async (req, res) => {
  const { originalUrl, expiresIn } = req.body;
  const shortUrl = shortid.generate();

  let expiresAt = null;
  if (expiresIn && Number.isInteger(expiresIn) && expiresIn > 0) {
    expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
  }

  const newUrl = new Url({ originalUrl, shortUrl, expiresAt });
  await newUrl.save();
  res.status(201).json({ originalUrl, shortUrl });
});

app.get("/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;
  const url = await Url.findOne({ shortUrl });

  if (!url) {
    return res.status(404).json({ error: "URL not found" });
  }

  if (url.expiresAt && url.expiresAt.getTime() < Date.now()) {
    return res.status(404).json({ error: "URL expired" });
  }

  url.clicks++;
  await url.save();

  res.redirect(url.originalUrl);
});

app.get("/api/url/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;
  const url = await Url.findOne({ shortUrl });

  if (!url) {
    return res.status(404).json({ error: "URL not found" });
  }

  res.status(200).json(url);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

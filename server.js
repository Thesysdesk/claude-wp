require("dotenv").config();

const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const wp = axios.create({
  baseURL: process.env.WP_URL + "/wp-json/wp/v2",
  auth: {
    username: process.env.WP_USERNAME,
    password: process.env.WP_APP_PASSWORD,
  },
  headers: {
    "Content-Type": "application/json",
  },
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/proof", (req, res) => {
  res.send("NEW VERSION LIVE");
});



app.get("/posts", async (req, res) => {
  try {
    const response = await wp.get("/posts");
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
});

app.post("/create-draft", async (req, res) => {
  try {
    const { title, content } = req.body;

    const response = await wp.post("/posts", {
      title: title,
      content: content,
      status: "draft",
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
});

app.post("/update-draft", async (req, res) => {
  try {
    const { id, title, content } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Post ID is required" });
    }

    const response = await wp.post("/posts/" + id, {
      title: title,
      content: content,
      status: "draft",
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
});

app.post("/publish-draft", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Post ID is required" });
    }

    const response = await wp.post("/posts/" + id, {
      status: "publish",
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port " + (process.env.PORT || 3000));
});























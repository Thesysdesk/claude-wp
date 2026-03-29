require("dotenv").config();

const express = require("express");
const axios = require("axios");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
  res.send("Claude + WordPress server is running");
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

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const response = await wp.post("/posts", {
      title,
      content,
      status: "draft",
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
});

app.post("/generate-draft", async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const msg = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1200,
      messages: [
        {
          role: "user",
          content: `Write a WordPress blog post draft about: ${topic}.

Return:
1. A strong blog title on the first line
2. Then the article body in clean HTML paragraphs
3. Keep it practical, readable, and publishable`,
        },
      ],
    });

    const text = msg.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    const lines = text.split("\n").filter(Boolean);
    const title =
      lines[0]?.replace(/^#\s*/, "").trim() || Draft about ${topic};

    const content = text;

    const wpResponse = await wp.post("/posts", {
      title,
      content,
      status: "draft",
    });

    res.json({
      message: "Draft created successfully",
      post: wpResponse.data,
    });
  } catch (error) {
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log("Claude + WordPress server running on port " + PORT);
});

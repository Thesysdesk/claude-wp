require("dotenv").config();

const express = require("express");
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Claude + WordPress server is running");
});

app.post("/generate-draft", async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const content = `# ${topic}

This is a generated draft about ${topic}.

- Point 1 about ${topic}
- Point 2 about ${topic}
- Point 3 about ${topic}
`;

    const lines = content.split("\n");
    const title = lines[0]?.replace(/^#\s*/, "").trim() || Draft about ${topic};
    const body = content;

    res.json({
      title,
      content: body,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log("Claude + WordPress server running on port " + PORT);
});

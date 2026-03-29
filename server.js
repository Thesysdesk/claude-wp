require("dotenv").config();

const express = require("express");
const axios = require("axios");

const app = express();
const cors = require("cors");
app.use(cors());
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
  res.send("MCP server is running");
});

app.get("/proof", (req, res) => {
  res.send("NEW VERSION LIVE");
});

app.post("/generate-draft", async (req, res) => {
  const body = req.body;

  try {
    // Tool discovery
    if (body.method === "tools/list") {
      return res.json({
        tools: [
          {
            name: "list_posts",
            description: "List recent WordPress posts",
            input_schema: {
              type: "object",
              properties: {}
            }
          },
          {
            name: "create_draft",
            description: "Create a WordPress draft post",
            input_schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                content: { type: "string" }
              },
              required: ["title", "content"]
            }
          },
          {
            name: "update_draft",
            description: "Update an existing WordPress draft",
            input_schema: {
              type: "object",
              properties: {
                id: { type: "number" },
                title: { type: "string" },
                content: { type: "string" }
              },
              required: ["id"]
            }
          },
          {
            name: "publish_draft",
            description: "Publish a WordPress draft by ID",
            input_schema: {
              type: "object",
              properties: {
                id: { type: "number" }
              },
              required: ["id"]
            }
          }
        ]
      });
    }

    // Tool execution
    if (body.method === "tools/call") {
      const { name, arguments: args } = body.params || {};

      if (name === "list_posts") {
        const response = await wp.get("/posts");

        return res.json({
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(response.data, null, 2)
              }
            ]
          }
        });
      }

      if (name === "create_draft") {
        const response = await wp.post("/posts", {
          title: args.title,
          content: args.content,
          status: "draft"
        });

        return res.json({
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(response.data, null, 2)
              }
            ]
          }
        });
      }

      if (name === "update_draft") {
        const response = await wp.post("/posts/" + args.id, {
          title: args.title,
          content: args.content,
          status: "draft"
        });

        return res.json({
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(response.data, null, 2)
              }
            ]
          }
        });
      }

      if (name === "publish_draft") {
        const response = await wp.post("/posts/" + args.id, {
          status: "publish"
        });

        return res.json({
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(response.data, null, 2)
              }
            ]
          }
        });
      }

      return res.status(400).json({
        error: "Unknown tool"
      });
    }

    return res.status(400).json({
      error: "Unsupported MCP method"
    });
  } catch (error) {
    return res.status(500).json({
      error: error.response?.data || error.message
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("MCP server running on port " + (process.env.PORT || 3000));
});






















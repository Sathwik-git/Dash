import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import cors from "cors"
import { TextBlock } from "@anthropic-ai/sdk/resources/messages";
import { designPrompt, getSystemPrompt } from "./prompt";
import { basePrompt as reactBasePrompt } from "./templates/react";
import { basePrompt as nodeBasePrompt } from "./templates/node";

const app = express();
dotenv.config();
app.use(cors())
app.use(express.json());
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const PORT = process.env.PORT || 3000;

app.post("/template", async (req, res) => {
  const userPrompt = req.body.prompt;
  const response = await anthropic.messages.create({
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 200,
    system:
      "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra",
  });

  const answer = (response.content[0] as TextBlock).text;
  if (answer == "react") {
    res.json({
      prompts: [
        designPrompt,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [reactBasePrompt],
    });
    return;
  }

  if (answer == "node") {
    res.json({
      prompts: [
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [nodeBasePrompt],
    });
    return;
  }

  res.status(403).json({ message: "You cant access this" });
  return;
});

app.post("/chat", async (req, res) => {
  const messages = req.body.messages;
  const response = await anthropic.messages.create({
    messages: messages,
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 8000,
    system: getSystemPrompt(),
  });
  res.json({
    response: (response.content[0] as TextBlock)?.text,
  });
});

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});

//   model: "claude-opus-4-20250514",

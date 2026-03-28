require("dotenv").config();
import express from "express";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import {basePrompt as nodeBasePrompt} from "./defaults/node";
import {basePrompt as reactBasePrompt} from "./defaults/react";
import cors from "cors";
import { generateText } from "./gemini";

const app = express();
app.use(cors())
app.use(express.json())

function buildVisibleFilesPrompt(basePrompt: string) {
    return `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`;
}

app.post("/template", async (req, res) => {
    try {
        const prompt = req.body.prompt;
        const answer = (await generateText({
            messages: [{
                role: "user",
                content: prompt
            }],
            maxOutputTokens: 16,
            thinkingBudget: 0,
            systemInstruction: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra"
        })).trim().toLowerCase();

        if (answer === "react") {
            res.json({
                prompts: [BASE_PROMPT, buildVisibleFilesPrompt(reactBasePrompt)],
                uiPrompts: [reactBasePrompt]
            })
            return;
        }

        if (answer === "node") {
            res.json({
                prompts: [buildVisibleFilesPrompt(nodeBasePrompt)],
                uiPrompts: [nodeBasePrompt]
            })
            return;
        }

        res.status(403).json({message: "You cant access this"})
    } catch (error) {
        const message = error instanceof Error ? error.message : "Template generation failed";
        res.status(500).json({ message });
    }
})

app.post("/chat", async (req, res) => {
    try {
        const messages = req.body.messages;
        const response = await generateText({
            messages,
            maxOutputTokens: 8192,
            systemInstruction: getSystemPrompt()
        });

        res.json({
            response
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Chat generation failed";
        res.status(500).json({ message });
    }
})

app.listen(3000);

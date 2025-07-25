"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const prompt_1 = require("./prompt");
const react_1 = require("./templates/react");
const node_1 = require("./templates/node");
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const anthropic = new sdk_1.default({ apiKey: process.env.ANTHROPIC_API_KEY });
const PORT = process.env.PORT || 3000;
app.post("/template", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userPrompt = req.body.prompt;
    const response = yield anthropic.messages.create({
        messages: [
            {
                role: "user",
                content: userPrompt,
            },
        ],
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 200,
        system: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra",
    });
    const answer = response.content[0].text;
    if (answer == "react") {
        res.json({
            prompts: [
                prompt_1.designPrompt,
                `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${react_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
            ],
            uiPrompts: [react_1.basePrompt],
        });
        return;
    }
    if (answer == "node") {
        res.json({
            prompts: [
                `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${node_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
            ],
            uiPrompts: [node_1.basePrompt],
        });
        return;
    }
    res.status(403).json({ message: "You cant access this" });
    return;
}));
app.post("/chat", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const messages = req.body.messages;
    const response = yield anthropic.messages.create({
        messages: messages,
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 8000,
        system: (0, prompt_1.getSystemPrompt)(),
    });
    res.json({
        response: (_a = response.content[0]) === null || _a === void 0 ? void 0 : _a.text,
    });
}));
app.listen(PORT, () => {
    console.log(`app listening on port ${PORT}`);
});
//   model: "claude-opus-4-20250514",

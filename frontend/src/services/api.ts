import axios from "axios";
import { BACKEND_URL } from "../config";

export const sendInitialPrompt = async (prompt: string): Promise<any> => {
  const response = await axios.post(`${BACKEND_URL}/template`, {
    prompt,
  });
  const { prompts, uiPrompts } = response.data;
  const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
    messages: [...prompts, prompt].map((content) => ({
      role: "user",
      content,
    })),
  });
  const finalresponse = stepsResponse.data.response;
  return { finalresponse, uiPrompts, prompts };
};



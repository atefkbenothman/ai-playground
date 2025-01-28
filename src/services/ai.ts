import { groq } from "@ai-sdk/groq"
import {
  generateText,
  experimental_wrapLanguageModel as wrapLanguageModel,
  extractReasoningMiddleware,
} from "ai"


const aiModel = wrapLanguageModel({
  model: groq("deepseek-r1-distill-llama-70b"),
  middleware: extractReasoningMiddleware({ tagName: "think" })
})

export async function generateAIResponse(systemMsg: string, userMsg: string) {
  const { text: response, reasoning } = await generateText({
    model: aiModel,
    messages: [
      { role: "system", content: systemMsg },
      { role: "user", content: userMsg },
    ]
  })
  console.log("ai reasoning:", reasoning)
  console.log("ai response:", response)
  return { response, reasoning }
}
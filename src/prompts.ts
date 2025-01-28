const BASE_SYSTEM_PROMPT = `
All code and any other additions must be production-ready and follow best practices.
Respond ONLY with valid XML in this exact format:
<response>
  <pullRequest>
    <title>Title of the pull request</title>
    <body>Detailed description of the changes</body>
  </pullRequest>
  <files>
    <file>
      <path>{File name}</path>
      <content>{TypeScript code here}</content>
    </file>
    <!-- Additional files -->
  </files>
</response>
`

export const PROMPTS = {
  typescript: "You are a TypeScript expert.",
  python: "You are a Python expert.",
}

export function getOrBuildSystemPrompt(prompt: string) {
  if (Object.keys(PROMPTS).includes(prompt)) {
    return PROMPTS[prompt] + BASE_SYSTEM_PROMPT
  } else {
    return prompt + BASE_SYSTEM_PROMPT
  }
}
import { config } from "dotenv"
import { Octokit } from "@octokit/rest"
import { groq } from "@ai-sdk/groq"
import {
  generateText,
  experimental_wrapLanguageModel as wrapLanguageModel,
  extractReasoningMiddleware,
} from "ai"
import { extractXMLFromResponse } from "./utils/xml"
import { parseModelResponse } from "./utils/utils"

// load env variables
config({ path: ".env" })

const GITHUB_OWNER = process.env.GITHUB_OWNER || null
const GITHUB_REPO = process.env.GITHUB_REPO || null
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || null

if (!GITHUB_OWNER || !GITHUB_REPO || !GITHUB_TOKEN) {
  throw new Error("Must set env variables")
}

// setup github api
const oktokit = new Octokit({ auth: GITHUB_TOKEN })

// setup ai sdk with groq
const aiModel = wrapLanguageModel({
  model: groq("deepseek-r1-distill-llama-70b"),
  middleware: extractReasoningMiddleware({ tagName: "think" })
})

/* config */
const SYSTEM_MSG = `
You are a TypeScript expert.
Add comments and logging to all typescript files in the repo.
Respond ONLY with valid XML in this exact format:
<response>
  <pullRequest>
    <title>Title of the pull request</title>
    <body>Detailed description of the changes</body>
  </pullRequest>
  <files>
    <file>
      <path>utils/xml.ts</path>
      <content>// TypeScript code here</content>
    </file>
    <!-- Additional files -->
  </files>
</response>
`

const USER_MSG = `
Add comments and logging to all typescript files in the repo.
- the comments should be helpful and explain what is going on in the code
- all comments should be short and concise
- add appropriate logging to the code where you see fit

Modify any existing comments if you can write a better comment.

All comments and logging should be production-ready and follow Typescript best practices.
`

const FEATURE_BRANCH = `feat/test`

// call the ai api to create a PR
async function createAutomatedPR() {
  try {
    console.log("Creating automated PR")

    const { text: rawResponse, reasoning } = await generateText({
      model: aiModel,
      messages: [
        {
          role: "system",
          content: "systemMsg"
        },
        {
          role: "user",
          content: "contentMsg"
        }
      ]
    })

    console.log("Raw Response:", rawResponse)
    console.log("Reasoning", reasoning)

    const xmlResponse = extractXMLFromResponse(rawResponse)
    console.log("Extracted XML:", xmlResponse)

    const { files, pr } = await parseModelResponse(xmlResponse)

    // get the default branch
    const { data: repo } = await oktokit.repos.get({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO
    })

    const defaultBranch = repo.default_branch
    const newFeatureBranch = FEATURE_BRANCH

    // get the SHA of the default branch
    const { data: ref } = await oktokit.git.getRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      ref: `heads/${defaultBranch}`
    })

    // create a new branch
    await oktokit.git.createRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      ref: `refs/heads/${newFeatureBranch}`,
      sha: ref.object.sha
    })

    // create/update all files
    for (const file of files) {
      await oktokit.repos.createOrUpdateFileContents({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: file.path,
        message: `Add ${file.path}`,
        content: Buffer.from(file.content).toString("base64"),
        branch: newFeatureBranch
      })
    }

    // create pull request
    const { data: pullRequest } = await oktokit.pulls.create({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      title: pr.title,
      body: pr.body,
      head: newFeatureBranch,
      base: defaultBranch
    })

    console.log("Pull request created:", pullRequest.html_url)

    // add model's response as a PR comment
    await oktokit.issues.createComment({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      issue_number: pullRequest.number,
      body: `## AI Model's Reasoning Process\n\n${reasoning}\n\n## Generated Files\n${files.map((f) => `- ${f.path}`).join("\n")}`
    })
  } catch (err) {
    console.error("Error creating PR:", err)
    if (err instanceof Error) {
      console.error("Error details:", err.message)
    }
  }
}

createAutomatedPR()
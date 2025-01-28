import { config } from "dotenv"
import { GithubService } from "./services/github"
import { generateAIResponse } from "./services/ai"
import { parseXMLFromResponse, extractModelResponse } from "./lib/parser"
import { getOrBuildSystemPrompt } from "./prompts"


// load environment variables
config({ path: ".env" })

const github_owner = process.env.GITHUB_OWNER
const github_repo = process.env.GITHUB_REPO
const github_token = process.env.GITHUB_TOKEN

if (!github_owner || !github_repo || !github_token) {
  throw new Error("Missing required environment variables")
}

// setup github service
const github = new GithubService(github_owner, github_repo, github_token)

const USER_MSG = `Create a file called test/add.py that has a function that returns the sum of two numbers.`

const FEATURE_BRANCH = "feat/test"

/* create automated PR */
try {
  const systemPrompt = getOrBuildSystemPrompt("python")

  const { response, reasoning } = await generateAIResponse(systemPrompt, USER_MSG)

  console.log("Reasoning:", reasoning)
  console.log("Response:", response)

  // parse xml portion of response
  // extract pr metadata and updated files content from xml
  const content = parseXMLFromResponse(response)
  const { prMetadata, files } = await extractModelResponse(content)

  const defaultBranch = await github.getDefaultBranch()

  // create new branch for PR
  await github.createBranch(FEATURE_BRANCH, defaultBranch)

  // create/update files included in PR
  await github.updateFiles(FEATURE_BRANCH, files)

  // create PR
  const pr = await github.createPullRequest(prMetadata.title, prMetadata.body, FEATURE_BRANCH, defaultBranch)

  // create PR comment with model's reasoning
  await github.addPullRequestComment(pr.number, `## AI Model's Reasoning Process\n\n${reasoning}\n\n## Generated Files\n${files.map((f) => `- ${f.path}`).join("\n")}`)

  console.log("Pull request successfully created:", pr.html_url)
} catch (err) {
  console.error("Error:", err)
  if (err === typeof Error) {
    console.error("Error msg:", err.message)
  }
}

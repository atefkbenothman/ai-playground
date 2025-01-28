
import { config } from "dotenv"
import { GithubService } from "./services/github"
import { generateAIResponse } from "./services/ai"
import { parseXMLFromResponse, extractModelResponse, formatRepoContents } from "./lib/parser"
import { BASE_SYSTEM_PROMPT } from "./prompts"
import { readLineInterface } from "./lib/input"

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

// fetch repo contents
console.log("Fetching files from repo:", github_repo)
const repoContent = await github.getRepositoryContents()
console.log("\nRepository files and their content lengths:")
repoContent.forEach(file => {
  console.log(`- File: ${file.path} (${file.content.length} characters)`)
})

const formattedRepoContents = formatRepoContents(repoContent)

// get user inputs
const userPrompt = await readLineInterface.getInput("\nUser message: ")
const featureBranch = await readLineInterface.getInput("\nBranch name: ")

readLineInterface.close()

/* create automated PR */
try {
  const sytemPrompt = BASE_SYSTEM_PROMPT.replace("{REPO_CONTENT", formattedRepoContents)

  const { response, reasoning } = await generateAIResponse(sytemPrompt, userPrompt)

  // parse xml portion of response
  // extract pr metadata and updated files content from xml
  const content = parseXMLFromResponse(response)
  const { prMetadata, files } = await extractModelResponse(content)

  const defaultBranch = await github.getDefaultBranch()

  // create new branch for PR
  await github.createBranch(featureBranch, defaultBranch)

  // create/update files included in PR
  await github.updateFiles(featureBranch, files)

  // create PR
  const pr = await github.createPullRequest(prMetadata.title, prMetadata.body, featureBranch, defaultBranch)

  // create PR comment with model's reasoning
  await github.addPullRequestComment(pr.number, `## AI Model's Reasoning Process\n\n${reasoning}\n\n## Generated Files\n${files.map((f) => `- ${f.path}`).join("\n")}`)

  console.log("Pull request successfully created:", pr.html_url)
} catch (err) {
  console.error("Error:", err)
  if (err === typeof Error) {
    console.error("Error msg:", err.message)
  }
}

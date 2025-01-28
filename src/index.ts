import { config } from "dotenv"
import { GithubService } from "./services/github"
import { generateAIResponse } from "./services/ai"
import { parseXMLFromResponse, extractModelResponse } from "./lib/parser"
import { getOrBuildSystemPrompt } from "./prompts"
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
const github = new GithubService(github_owner, github_repo, github_token);

(async () => {
  const systemPrompt = await readLineInterface.getInput("System message: ")
  const userPrompt = await readLineInterface.getInput("User message: ")
  const featureBranch = await readLineInterface.getInput("Branch name: ")

  readLineInterface.close()

  /* create automated PR */
  try {
    const completeSystemPrompt = getOrBuildSystemPrompt(systemPrompt)

    const { response, reasoning } = await generateAIResponse(completeSystemPrompt, userPrompt)

    console.log("Reasoning:", reasoning)
    console.log("Response:", response)

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

})()
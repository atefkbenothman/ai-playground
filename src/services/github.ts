
import { Octokit } from "@octokit/rest"

export class GithubService {
  private owner: string
  private repo: string
  private oktokit: Octokit

  constructor(owner: string, repo: string, token: string) {
    this.owner = owner
    this.repo = repo
    this.oktokit = new Octokit({ auth: token })
  }

  async getRepo() {
    const { data } = await this.oktokit.repos.get({
      owner: this.owner,
      repo: this.repo
    })
    return data
  }

  async getDefaultBranch(): Promise<string> {
    const repo = await this.getRepo()
    return repo.default_branch
  }

  async createBranch(newBranch: string, defaultBranch: string): Promise<void> {
    const { data } = await this.oktokit.git.getRef({
      owner: this.owner,
      repo: this.repo,
      ref: `heads/${defaultBranch}`
    })
    await this.oktokit.git.createRef({
      owner: this.owner,
      repo: this.repo,
      ref: `refs/heads/${newBranch}`,
      sha: data.object.sha
    })
  }

  async updateFiles(branchName: string, files: { path: string, content: string }[]): Promise<void> {
    for (const file of files) {
      const { data: fileData } = await this.oktokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: file.path
      })
      if (fileData && "sha" in fileData) {
        await this.oktokit.repos.createOrUpdateFileContents({
          owner: this.owner,
          repo: this.repo,
          path: file.path,
          message: `Update ${file.path}`,
          content: Buffer.from(file.content).toString("base64"),
          sha: fileData.sha,
          branch: branchName
        })
      } else {
        await this.oktokit.repos.createOrUpdateFileContents({
          owner: this.owner,
          repo: this.repo,
          path: file.path,
          message: `Create ${file.path}`,
          content: Buffer.from(file.content).toString("base64"),
          branch: branchName
        });
      }
    }
  }

  async createPullRequest(title: string, body: string, headBranch: string, baseBranch: string) {
    const { data } = await this.oktokit.pulls.create({
      owner: this.owner,
      repo: this.repo,
      title: title,
      body: body,
      head: headBranch,
      base: baseBranch
    })
    return data
  }

  async addPullRequestComment(prNumber: number, comment: string): Promise<void> {
    await this.oktokit.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      issue_number: prNumber,
      body: comment
    })
  }

  async getRepositoryContents(path: string = ""): Promise<Array<{ path: string, content: string }>> {
    // Get the contents of the specified path
    const { data } = await this.oktokit.repos.getContent({
      owner: this.owner,
      repo: this.repo,
      path
    })

    // Initialize empty array to hold all contents
    const contents: Array<{ path: string, content: string }> = []

    // Process each item in the response
    for (const item of data) {
      if (item.type === 'dir') {
        // If it's a directory, recursively get its contents
        const dirContents = await this.getRepositoryContents(item.path)
        contents.push(...dirContents)
      } else {
        // If it's a file, get its contents
        const fileContent = Buffer.from(item.content || '', 'base64').toString('utf-8')
        contents.push({ path: item.path, content: fileContent })
      }
    }

    return contents
  }
}
      
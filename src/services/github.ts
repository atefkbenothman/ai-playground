
export class GithubService {
  // ... existing code ...

  async getRepositoryContents(path: string = ""): Promise<Array<{ path: string, content: string }>> {
    try {
      const { data } = await this.oktokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
        recursive: true
      })

      return data
        .filter(item => item.type === 'file')
        .map(item => ({
          path: item.path,
          content: Buffer.from(item.content, "base64").toString("utf-8")
        }))
    } catch (error) {
      console.error("Failed to get repository contents:", error)
      return []
    }
  }

  // ... existing code ...
}

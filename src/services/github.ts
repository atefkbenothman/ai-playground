
import { Octokit } from "@octokit/rest"

export class GithubService {
  // ... existing code ...

  async getRepositoryContents(): Promise<Array<{ path: string, content: string }>> {
    const { data } = await this.oktokit.repos.getContent({
      owner: this.owner,
      repo: this.repo
    })

    return data.map(item => {
      if (item.type === 'file') {
        const content = Buffer.from(item.content || '', 'base64').toString('utf-8')
        return { path: item.path, content }
      }
      return { path: item.path, content: '' }
    })
  }

  // ... existing code ...
}
      
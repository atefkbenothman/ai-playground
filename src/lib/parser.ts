import { parseStringPromise } from "xml2js"


export type PRMetadata = {
  title: string
  body: string
}

export type FileContent = {
  path: string
  content: string
}

export type PRContent = {
  prMetadata: PRMetadata
  files: FileContent[]
}

export function parseXMLFromResponse(response: string): string {
  const start = response.indexOf("<response>")
  const end = response.indexOf("</response>") + "</response>".length

  if (start === -1 || end === -1) {
    throw new Error("Could not find valid XML in model response")
  }

  return response.slice(start, end)
}

export async function extractModelResponse(response: string): Promise<PRContent> {
  const parsed = await parseStringPromise(response)
  const data: PRContent = {
    prMetadata: {
      title: parsed.response.pullRequest[0].title[0],
      body: parsed.response.pullRequest[0].body[0],
    },
    files: parsed.response.files[0].file.map(f => ({
      path: f.path[0],
      content: f.content[0]
    }))
  }
  return data
}

export function formatRepoContents(files: FileContent[]): string {
  return files.map(file => (
    `===============================================\n` +
    `File: ${file.path}\n` +
    `===============================================\n` +
    `${file.content}\n`
  )).join("\n\n")
}
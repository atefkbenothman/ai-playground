import { XMLParser } from "fast-xml-parser"


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

export async function extractModelResponse(xmlResponse: string): Promise<PRContent> {
  const parser = new XMLParser({
    isArray: (name) => {
      return ["file"].includes(name)
    },
    ignoreAttributes: false,
  })
  const parsed = parser.parse(xmlResponse)
  const data: PRContent = {
    prMetadata: {
      title: parsed.response.pullRequest.title,
      body: parsed.response.pullRequest.body,
    },
    files: parsed.response.files.file.map(f => ({
      path: f.path,
      content: f.content
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
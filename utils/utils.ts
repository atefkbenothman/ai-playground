import { parseStringPromise } from "xml2js";

type FileContent = {
  path: string
  content: string
}

type PRMetadata = {
  title: string
  body: string
}

type GeneratedContent = {
  files: FileContent[]
  pr: PRMetadata
}

export async function parseModelResponse(xmlResponse: string): Promise<GeneratedContent> {
  const parsed = await parseStringPromise(xmlResponse)
  return {
    files: parsed.response.files[0].file.map(f => ({
      path: f.path[0],
      content: f.content[0]
    })),
    pr: {
      title: parsed.response.pullRequest[0].title[0],
      body: parsed.response.pullRequest[0].body[0]
    }
  }
}
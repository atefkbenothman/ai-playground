export function extractXMLFromResponse(text: string): string {
  const xmlStart = text.indexOf("<response>")
  const xmlEnd = text.indexOf("</response>") + "</response>".length
  if (xmlStart === -1 || xmlEnd === -1) {
    throw new Error("Could not find valid XML in model response")
  }
  return text.slice(xmlStart, xmlEnd)
}
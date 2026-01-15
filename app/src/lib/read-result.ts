// lib/read-result.ts
import { storage } from "./gcs";

export async function readDocumentResult(
  bucketName: string,
  prefix: string
) {
  const [files] = await storage
    .bucket(bucketName)
    .getFiles({ prefix });

  const jsonFile = files.find(f => f.name.endsWith(".json"));
  if (!jsonFile) return null;

  const [content] = await jsonFile.download();
  return JSON.parse(content.toString());
}

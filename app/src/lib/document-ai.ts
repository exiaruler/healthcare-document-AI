// lib/document-ai.ts
import { docClient } from "./gcs";
import crypto from "crypto";
export async function processDocument(gcsUri: string) {
const name = `projects/${process.env.GCP_PROJECT_ID}/locations/${process.env.GCP_LOCATION}/processors/${process.env.GCP_PROCESSOR_ID}`;
let outputPrefix = `gs://${process.env.GCS_BUCKET}/document-ai-output/`;

const request = {
    name,
    inputDocuments: {
      gcsDocuments: {
        documents: [
          {
            gcsUri,
            mimeType: "application/pdf",
          },
        ],
      },
    },
    documentOutputConfig: {
      gcsOutputConfig: {
        gcsUri: outputPrefix,
      },
    },
  };
  const [operation] = await docClient.batchProcessDocuments(request);
  await operation.promise();
  const operationId = operation.name!.split("/").pop()!;
  outputPrefix=`document-ai-output/${operationId}/0`;
  console.log(operation.metadata);
  console.log(outputPrefix)
  return outputPrefix;
}

import { Storage } from "@google-cloud/storage";
import { DocumentProcessorServiceClient } from "@google-cloud/documentai";

const gcpCredentials = {
  client_email: process.env.GCP_CLIENT_EMAIL!,
  private_key: process.env.GCP_PRIVATE_KEY!.replace(/\\n/g, "\n"),
};
export const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials:gcpCredentials,
});
export const docClient = new DocumentProcessorServiceClient({
    projectId: process.env.GCP_PROJECT_ID,
    credentials:gcpCredentials
});

export const bucket = storage.bucket(process.env.GCS_BUCKET!);


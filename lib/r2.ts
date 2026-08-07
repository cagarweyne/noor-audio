import "server-only";
import { AwsClient } from "aws4fetch";

// R2 S3-compatible endpoint. These credentials are SERVER ONLY (a bucket-scoped
// Read & Write token) — they never reach the client. The browser uploads via a
// short-lived presigned URL, so the secret stays here.
const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const BUCKET = process.env.R2_BUCKET_NAME;
const endpoint = `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`;

let client: AwsClient | null = null;
function r2(): AwsClient {
  if (!client) {
    client = new AwsClient({
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      region: "auto", // R2 requires region "auto" + service "s3" for valid SigV4
      service: "s3",
    });
  }
  return client;
}

// A presigned PUT URL the browser uploads the file bytes to. Expiry is generous
// (1h) to absorb client/server clock skew and long uploads of large files —
// a too-short window fails with `ExpiredRequest` if the machine clock lags R2.
// Content-Type is intentionally NOT signed, so the client can set it freely.
export async function presignPutUrl(key: string, expiresInSec = 3600): Promise<string> {
  const url = new URL(`${endpoint}/${BUCKET}/${encodeURI(key)}`);
  url.searchParams.set("X-Amz-Expires", String(expiresInSec));
  const signed = await r2().sign(url.toString(), { method: "PUT", aws: { signQuery: true } });
  return signed.url;
}

// Delete an object (used when a user deletes a collection/track).
export async function deleteObject(key: string): Promise<void> {
  const res = await r2().fetch(`${endpoint}/${BUCKET}/${encodeURI(key)}`, { method: "DELETE" });
  if (!res.ok && res.status !== 404) {
    throw new Error(`R2 delete failed (${res.status}) for ${key}`);
  }
}

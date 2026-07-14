import { createHmac, timingSafeEqual } from "node:crypto";

export interface JwtPayload {
  userId: number;
  role: string;
  iat: number;
}

const HEADER = { alg: "HS256", typ: "JWT" };

function base64UrlEncode(input: string | Buffer): string {
  const buffer = typeof input === "string" ? Buffer.from(input) : input;
  return buffer.toString("base64url");
}

function base64UrlDecode(input: string): Buffer {
  return Buffer.from(input, "base64url");
}

export function signJwt(
  payload: Omit<JwtPayload, "iat">,
  secret: string,
): string {
  const fullPayload: JwtPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(HEADER));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", secret).update(signingInput).digest();
  const encodedSignature = base64UrlEncode(signature);
  return `${signingInput}.${encodedSignature}`;
}

export function verifyJwt(token: string, secret: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const expectedSignature = createHmac("sha256", secret)
    .update(signingInput)
    .digest();
  const actualSignature = base64UrlDecode(encodedSignature);

  if (expectedSignature.length !== actualSignature.length) {
    return null;
  }
  if (!timingSafeEqual(expectedSignature, actualSignature)) {
    return null;
  }

  let header: unknown;
  try {
    header = JSON.parse(base64UrlDecode(encodedHeader).toString("utf8"));
  } catch {
    return null;
  }
  if (
    typeof header !== "object" ||
    header === null ||
    (header as { alg?: string }).alg !== "HS256"
  ) {
    return null;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload).toString("utf8"));
  } catch {
    return null;
  }
  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof (payload as { userId?: unknown }).userId !== "number" ||
    typeof (payload as { role?: unknown }).role !== "string"
  ) {
    return null;
  }
  return payload as JwtPayload;
}

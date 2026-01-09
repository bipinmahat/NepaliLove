import pino from "pino";

// Redact or remove sensitive fields from logs
const redactPaths = [
  "req.headers.cookie",
  "res",
  "sess",
  "password",
  "email",
];

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  redact: redactPaths,
});

export function safeLog(level: "info" | "warn" | "error" | "debug", msg: string, obj?: any) {
  if (obj) {
    // shallow copy and redact known fields
    const copy = { ...obj };
    if (copy?.req?.headers) {
      delete copy.req.headers.cookie;
    }
    if (copy?.sess) {
      delete copy.sess;
    }
    logger[level](copy, msg);
    return;
  }
  logger[level](msg);
}

export default logger;

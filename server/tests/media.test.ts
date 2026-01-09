import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { validateMediaFile } from "../media";

describe("validateMediaFile", () => {
  it("validates JPEG by header", async () => {
    const p = path.join(process.cwd(), "tmp-jpeg-test");
    // JPEG magic bytes
    await fs.promises.writeFile(p, Buffer.from([0xff, 0xd8, 0xff, 0xdb, 0x00, 0x10]));
    const ok = await validateMediaFile(p, "image/jpeg");
    await fs.promises.unlink(p);
    expect(ok).toBe(true);
  });

  it("validates PNG by header", async () => {
    const p = path.join(process.cwd(), "tmp-png-test");
    await fs.promises.writeFile(p, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]));
    const ok = await validateMediaFile(p, "image/png");
    await fs.promises.unlink(p);
    expect(ok).toBe(true);
  });

  it("rejects mismatched MIME and content", async () => {
    const p = path.join(process.cwd(), "tmp-fake");
    await fs.promises.writeFile(p, Buffer.from([0x00, 0x11, 0x22, 0x33]));
    const ok = await validateMediaFile(p, "image/png");
    await fs.promises.unlink(p);
    expect(ok).toBe(false);
  });

  it("validates MP4 via ftyp presence", async () => {
    const p = path.join(process.cwd(), "tmp-mp4");
    // include 'ftyp' within first 12 bytes
    const buf = Buffer.alloc(12);
    buf.write("ftyp", 4);
    await fs.promises.writeFile(p, buf);
    const ok = await validateMediaFile(p, "video/mp4");
    await fs.promises.unlink(p);
    expect(ok).toBe(true);
  });
});

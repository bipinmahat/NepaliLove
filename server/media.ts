import fs from "fs";

// media magic header validation (exported for unit testing)
export async function validateMediaFile(filePath: string, mimetype: string) {
  try {
    const fd = await fs.promises.open(filePath, "r");
    const header = Buffer.alloc(12);
    await fd.read(header, 0, 12, 0);
    await fd.close();

    // images
    if (mimetype.startsWith("image/")) {
      // JPEG
      if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) return true;
      // PNG
      if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47) return true;
      // GIF
      if (header.toString("ascii", 0, 3) === "GIF") return true;
      // WebP ('RIFF'....'WEBP')
      if (header.toString("ascii", 0, 4) === "RIFF") return true;
      return false;
    }

    // videos: check for MP4 (ftyp) or WebM (EBML signature)
    if (mimetype.startsWith("video/")) {
      // WebM/Matroska: 0x1A 0x45 0xDF 0xA3
      if (header[0] === 0x1a && header[1] === 0x45 && header[2] === 0xdf && header[3] === 0xa3) return true;
      // MP4: 'ftyp' box within first 12 bytes
      if (header.toString().includes("ftyp")) return true;
      return false;
    }

    return false;
  } catch (e) {
    return false;
  }
}

export default validateMediaFile;

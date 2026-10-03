// Generates content/blur.json: { "/images/placeholders/x.jpg": "data:image/jpeg;base64,..." }
// Run: node scripts/blur.mjs   (re-run whenever images change)
import sharp from "sharp";
import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), "public/images/placeholders");
const out = {};
for (const file of readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))) {
  const buf = await sharp(join(dir, file)).resize(14, 14, { fit: "inside" }).jpeg({ quality: 45 }).toBuffer();
  out[`/images/placeholders/${file}`] = `data:image/jpeg;base64,${buf.toString("base64")}`;
}
writeFileSync(join(process.cwd(), "content/blur.json"), JSON.stringify(out, null, 0));
console.log(`blur.json: ${Object.keys(out).length} images`);

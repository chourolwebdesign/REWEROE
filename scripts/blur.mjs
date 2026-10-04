// Generates content/blur.json for public/images/placeholders and public/images/store: { "/images/placeholders/x.jpg": "data:image/jpeg;base64,..." }
// Run: node scripts/blur.mjs   (re-run whenever images change)
import sharp from "sharp";
import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dirs = ["public/images/placeholders", "public/images/store"];
const out = {};
for (const rel of dirs) for (const file of readdirSync(join(process.cwd(), rel)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))) {
  const buf = await sharp(join(process.cwd(), rel, file)).resize(14, 14, { fit: "inside" }).jpeg({ quality: 45 }).toBuffer();
  out[`/${rel.replace("public/", "")}/${file}`] = `data:image/jpeg;base64,${buf.toString("base64")}`;
}
writeFileSync(join(process.cwd(), "content/blur.json"), JSON.stringify(out, null, 0));
console.log(`blur.json: ${Object.keys(out).length} images`);

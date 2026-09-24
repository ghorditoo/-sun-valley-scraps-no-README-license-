import sharp from "sharp";

const sizes = [512, 1024];
for (const size of sizes) {
  await sharp("public/logos/logo-mark.svg")
    .resize(size, size)
    .png()
    .toFile(`public/logos/logo-mark-${size}.png`);
  console.log(`Generated logo-mark-${size}.png`);
}

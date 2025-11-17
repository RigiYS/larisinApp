const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sizes = [512, 48];
const input = path.resolve(process.cwd(), 'src', 'assets', 'logo-small.png');

if (!fs.existsSync(input)) {
  console.error('Input file not found:', input);
  process.exit(2);
}

(async () => {
  try {
    for (const size of sizes) {
      const output = path.resolve(process.cwd(), 'src', 'assets', `logo-small-circle-${size}.png`);
      const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="#fff"/></svg>`;

      await sharp(input)
        .resize(size, size, { fit: 'cover' })
        .composite([{ input: Buffer.from(svg), blend: 'dest-in' }])
        .png()
        .toFile(output);

      console.log('Wrote', output);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

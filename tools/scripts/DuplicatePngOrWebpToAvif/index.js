const fs = require("fs");
const path = require("path");
const glob = require("glob");
const sharp = require("sharp");

const inputType = process.argv[2];
if (!["png", "webp"].includes(inputType)) throw 'Invalid input type, must be "png" or "webp"';
const inputPath = process.argv[3];
if (!inputPath) throw 'No folder file path provided to search';
const outputPath = process.argv[4];
const properPath = inputPath.replace(/\\/g, "/");

glob.glob(properPath + (properPath.endsWith("/") ? `**/*.${inputType}` : `/**/*.${inputType}`)).then(async paths => {
    for (const imagePath of paths) {
        const avifName = `${path.basename(imagePath).split(".").slice(0, -1).join(".")}.avif`;
        const newPath = outputPath ? path.join(outputPath, avifName) : path.normalize(`${path.dirname(imagePath)}/${avifName}`);
        const image = fs.readFileSync(imagePath);
        await sharp(image)
            .avif()
            .toFile(newPath);
    }
});
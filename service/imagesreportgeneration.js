const ejs = require('ejs');
const fs = require('fs');
const Jimp = require('jimp');
const path = require('path');


const filePath = path.join(__dirname, 'locationimage.ejs');
const imageTemplate = fs.readFileSync(filePath, 'utf8');
const quality = 60;

const replaceImagesInTemplate =  async function(images){
    try {
      const compressedImages = await compressImages(images, quality);
      const html_images = ejs.render(imageTemplate, { images: compressedImages, factor: 4 });
      return html_images;
    } catch (err) {
      console.error('Error generating HTML:', err);
    }
  }

async function compressImages(images, quality) {
  const compressedImages = [];

  for (const image of images) {
    const jimpImage = await Jimp.read(image);
    const compressedBuffer = await jimpImage.quality(quality).getBufferAsync(Jimp.MIME_JPEG);
    const compressedUrl = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
    compressedImages.push({ compressedUrl, description: image.description });
  }

  return compressedImages;
}

module.exports = {replaceImagesInTemplate};
const ejs = require("ejs");
const fs = require("fs");
const Jimp = require("jimp");
const path = require("path");
const filePath = path.join(__dirname, "locationimage.ejs");
const imageTemplate = fs.readFileSync(filePath, "utf8");

const logoFilePath = path.join(__dirname, "logo.jpg");
const replaceImagesInTemplate = async function (
  images,
  sectionImageProperties,
  header
) {
  try {
    const compressedImages = [];
    const quality = Number(sectionImageProperties.compressionQuality);
    const finalImages = await compressImages(images, quality)
    compressedImages.push(...(finalImages));
    const html_images = ejs.render(imageTemplate, {
      images: compressedImages,
      factor: 3,
      imagesHeader: header,
      logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3tbd0HJj8xGjZj3gGSNwfP-wQGea1Q19MafUGLuDwqw&s',
    });
    return html_images;
  } catch (err) {
    console.error("Error generating HTML:", err);
  }
};

async function compressImages(images, quality) {
  const compressedImages = [];
  if(!Array.isArray(images))  
  {
    images = [images];
  }
  for (const image of images) {
    try {
      if ((quality = 100)) {
        const compressedUrl = image;
        compressedImages.push({
          compressedUrl,
          description: "not compressed",
        });
      } else {
        var compressedBuffer;
        const jimpImage = await Jimp.read(image);
        if (jimpImage._exif != null) {
          const orientation = jimpImage._exif.tags.Orientation; // Assume orientation property exists for each image
          const rotatedImage = await rotateImage(jimpImage, orientation);
          compressedBuffer = await rotatedImage
            .quality(quality)
            .getBufferAsync(Jimp.MIME_JPEG);
        } else {
          compressedBuffer = await jimpImage
            .quality(quality)
            .getBufferAsync(Jimp.MIME_JPEG);
        }

        const compressedUrl = `data:image/jpeg;base64,${compressedBuffer.toString(
          "base64"
        )}`;
        compressedImages.push({
          compressedUrl,
          description: image.description,
        });
      }
      
    } catch (error) {
      console.error("Error compressing images:", error);
    }
  }
  return compressedImages;
}

async function rotateImage(jimpImage, orientation) {
  if (orientation === 6) {
    return jimpImage.rotate(90); // Rotate 90° clockwise for orientation 6
  } else if (orientation === 8) {
    return jimpImage.rotate(-90); // Rotate 90° counter-clockwise for orientation 8
  }

  return jimpImage;
}

module.exports = { replaceImagesInTemplate };

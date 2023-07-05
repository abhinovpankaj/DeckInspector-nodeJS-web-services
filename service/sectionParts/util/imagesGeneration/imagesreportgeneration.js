const ejs = require('ejs');
const fs = require('fs');
const Jimp = require('jimp');
const path = require('path');
const filePath = path.join(__dirname, 'locationimage.ejs');
const imageTemplate = fs.readFileSync(filePath, 'utf8');

const replaceImagesInTemplate =  async function(images,sectionImageProperties,header){
    try {
      const compressedImages = [];
      const quality = Number(sectionImageProperties.compressionQuality);
      if (quality==100) {
        
      
      for (const image of images) {
        compressedImages.push({ compressedUrl:image, description: "not compressed" });
      }
    }else{
      compressedImages.push( await compressImages(images, quality));
    }
      
      const html_images = ejs.render(imageTemplate,  
        {images: compressedImages, factor: sectionImageProperties.imageFactor ,imagesHeader:header});
      return html_images;
    } catch (err) {
      console.error('Error generating HTML:', err);
    }
  }

  async function compressImages(images, quality) {
    const compressedImages = [];
    
    for (const image of images) {
      try{
        var compressedBuffer;
        const jimpImage = await Jimp.read(image);
        if (jimpImage._exif!=null) {
          const orientation = jimpImage._exif.tags.Orientation; // Assume orientation property exists for each image
          const rotatedImage  = await rotateImage(jimpImage, orientation);
          compressedBuffer= await rotatedImage
          .quality(quality)
          .getBufferAsync(Jimp.MIME_JPEG);
        }else{
          compressedBuffer= await jimpImage
          .quality(quality)
          .getBufferAsync(Jimp.MIME_JPEG);
        }
        
        const compressedUrl = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
        compressedImages.push({ compressedUrl, description: image.description });
      }
      catch (error) {
        
        console.error('Error compressing images:', error); 
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

module.exports = {replaceImagesInTemplate};
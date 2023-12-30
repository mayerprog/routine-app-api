const { Image } = require("../schemas/users");

async function saveImages(files) {
  let imageNames = [];
  let savedImages;

  if (files && files.length > 0) {
    const imageSavePromises = files.map(async (file) => {
      imageNames.push(file.filename);
      const image = new Image({
        name: file.filename,
        data: file.path,
        contentType: file.mimetype,
      });
      return image.save();
    });

    try {
      savedImages = await Promise.all(imageSavePromises);
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }

  return { imageNames, savedImages };
}

module.exports = saveImages;

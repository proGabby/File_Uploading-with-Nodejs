const path = require('path');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
 
//save image locally
const uploadProductImageLocal = async (req, res) => {
  //check if file exists
  if (!req.files) {
    throw new CustomError.BadRequestError('No File Uploaded');
  }

  const productImage = req.files.image;

  //check file format
  if (!productImage.mimetype.startsWith('image')) {
    throw new CustomError.BadRequestError('Please Upload Image');
  }

  //check file size
  const maxSize = 1024 * 1024;
  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError('Please upload image smaller 1MB');
  }

  //save image as static file on the server
  const imagePath = path.join(
    __dirname,
    '../public/uploads/' + `${productImage.name}`
  );
  
  //to enable usage of the file elsewhere in the server
  await productImage.mv(imagePath);

  return res
    .status(StatusCodes.OK)
    .json({ image: { src: `/uploads/${productImage.name}` } });
};


//save image on cloudinary cloud
const uploadProductImage = async (req, res) => {
  //check if file exists
  if (!req.files) {
    throw new CustomError.BadRequestError('No File Uploaded');
  }

  //save image on cloundinary
  const result = await cloudinary.uploader.upload(
    req.files.image.tempFilePath, //ensure file is save in a temp folder on server
    {
      use_filename: true,
      folder: 'file-upload',
    }
  ); 

  //remove the temp file on the server
  fs.unlinkSync(req.files.image.tempFilePath);

  //return the image url
  return res.status(StatusCodes.OK).json({ image: { src: result.secure_url } });
};

module.exports = {
  uploadProductImage,
};

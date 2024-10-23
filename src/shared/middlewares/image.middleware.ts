import { ExpressController } from "../types";
import multer from "multer";
import { BadException, InternalServerErrorException } from "../errors";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fieldSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new BadException('only image files are allowed'));
      return;
    }
    cb(null, true)
  }

}).single('cover_image');

/** 
 * ImageMiddleware is a middleware function that checks if the request contains an image file.
 * It checks the content-type of the request and ensures that the file is an image.
 * If the request contains an image file, it uploads the file to the server.
 * If the request does not contain an image file, it calls the next middleware function.
*/

export const imageMiddleware: ExpressController = (req, res, next) => {
  if (!next) {
    throw new InternalServerErrorException()
  }

  const contentType = req.headers['content-type']
  const isMultipart = contentType?.startsWith('multipart/form-data')
  if (req.body?.cover_image && !isMultipart) {
    throw new BadException('Content-Type must be multipart/form-data');
  }

  if (isMultipart) {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return next(new BadException(`File upload error: ${err.message}`));
      } else if (err) {
        return next(new BadException('Unknown error occurred during file upload'));
      }
      next();
    });
  } else {
    next();
  }
};

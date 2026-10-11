import multer from 'multer';
import { isHttpError } from 'http-errors';



export const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 2MB)' : err.message,
    });
  }
  if (isHttpError(err)) {
    return res.status(err.status).json({
      message: err.message,
    });
  }


  res.status(500).json({
    message: err.message
  });
};

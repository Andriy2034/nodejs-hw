import { isHttpError } from 'http-errors';



export const errorHandler = (err, req, res, next) => {
  if (isHttpError(err)) {
    return res.status(err.status).json({
      message: err.message,
    });
  }

  const isPod = process.env.NODE_ENV === 'production';

  res.status(500).json({
    message: isPod ? err.message : err.stack,
  });
};

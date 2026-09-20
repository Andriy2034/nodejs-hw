import { Segments, Joi } from 'celebrate';
import { Tags } from '../constans/tags.js';
import { isValidObjectId } from 'mongoose';

const objectIdValidator = (value, helpers) => {
  if (isValidObjectId(value)) {
    return value;
  }
  return helpers.message('Error: Invalid ObjectId');
};


export const getAllNotesSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1),
    perPage: Joi.number().integer().min(5).max(20),

  })
};

export const createNoteSchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(2).max(20).required(),
    content: Joi.string().min(3).max(200),
    tag: Joi.string()
      .valid(...Tags)
      .default('Todo'),
  }),
};

export const noteIdSchema = {
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().custom(objectIdValidator).required(),
  }),
};

export const updateNoteSchema = {
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(2).max(20),
    content: Joi.string().min(3).max(200),
    tag: Joi.string()
      .valid(...Tags)
      .default('Todo'),
  }).min(2),
  ...noteIdSchema,
};

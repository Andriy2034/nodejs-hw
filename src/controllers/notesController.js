import { Note } from '../models/note.js';
import createError from 'http-errors';

export const getNoteById = async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findOne({
    _id: noteId, userId: req.user._id});
  if (!note) {
    throw createError(404, 'Note not found');
  }
  res.status(200).json(note);
};

export const getAllNotes = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const perPage = Math.max(1, Number(req.query.perPage) || 10);
  const { tag, search } = req.query;

  const skip = (page - 1) * perPage;

  const notesQuery = Note.find({
    userId: req.user._id,
  });

  if (tag) {
    notesQuery.where('tag').equals(tag);
  }

  if (search) {
    notesQuery.where({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ],
    });
  }

  const [notes, totalItems] = await Promise.all([
    notesQuery.clone().skip(skip).limit(perPage).exec(),
    notesQuery.clone().countDocuments().exec(),
  ]);

  const totalPages = Math.ceil(totalItems / perPage);

  return res.status(200).json({
    page,
    perPage,
    totalItems,
    totalPages,
    notes,
  });
};

export const createNote = async (req, res) => {
  const newNote = await Note.create({
    ...req.body,
    userId: req.user._id,
  });
  res.status(201).json(newNote);
};


export const deleteNote = async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findOneAndDelete({
    _id: noteId,
    userId: req.user._id
  });
  if (!note) {
    throw createError(404, 'Note not found');
  }
  res.status(200).json(note);
};

export const updateNote = async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findOneAndUpdate({
    _id: noteId,
     userId: req.user._id
     },
      req.body, {
    returnDocument: 'after',
  });
  if (!note) {
    throw createError(404, 'Note not found');
  }
  res.status(200).json(note);
};

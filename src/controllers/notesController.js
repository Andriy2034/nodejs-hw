import { Note } from '../models/note.js';
import createError from 'http-errors';

export const getNoteById = async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findOne({ _id: noteId });
  if (!note) {
    throw createError(404, 'Note not found');
  }
  res.status(200).json(note);
};

export const getAllNotes = async (req, res) => {
  const { page, perPage, tag, search } = req.query;
  const skip = (page - 1) * perPage;
  const limit = perPage;

  const notesQuery = Note.find();

  if (tag) {
    notesQuery.where(`tag`).equals(tag);
  }
  if (search) {
    notesQuery.or([
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ]);
  }

  const [totalNotes, notes] = await Promise.all([
    notesQuery.clone().countDocuments(),
    notesQuery.skip(skip).limit(limit),
  ]);
  const totalPages = Math.ceil(totalNotes / perPage);


  res.status(200).json({
    page,
    perPage,
    totalNotes,
    totalPages,
    notes,
  });
};

export const createNote = async (req, res) => {
  const newNotes = await Note.create(req.body);
  res.status(201).json(newNotes);
};

export const deleteNote = async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findOneAndDelete({ _id: noteId });
  if (!note) {
    throw createError(404, 'Note not found');
  }
  res.status(200).json(note);
};

export const updateNote = async (req, res) => {
  const { noteId } = req.params;
  const note = await Note.findOneAndUpdate({ _id: noteId }, req.body, {
    returnDocument: 'after',
  });
  if (!note) {
    throw createError(404, 'Note not found');
  }
  res.status(200).json(note);
};

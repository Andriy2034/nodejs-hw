import {Router} from "express";
import { getOneNotes, createNote, getAllNotes, deleteNote, updateNote} from '../controllers/notesController.js';


const router = Router();

router.get("/notes", getAllNotes);
router.get("/notes/:noteId", getOneNotes);
router.post("/notes", createNote);
router.delete("/notes/:noteId", deleteNote);
router.patch("/notes/:noteId", updateNote);


export default router;

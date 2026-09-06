import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pinoHttp from "pino-http";


dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(pinoHttp());
app.use(express.json());



app.get ("/notes", (req, res) => {
  res.status(200).json({
    message: "Retrieved all notes",
  });
});

app.get("/notes/:noteId", (req, res) => {
  const {noteId} = req.params;

  res.status(200).json({
    message: `Retrieved note with id: ${noteId}`,
  });
});


app.get('/test-error', () => {
  throw new Error('Simulated server error');
});

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});


app.use((err, req, res, next) => {
  res.status(500).json({
    message: "Internal server error",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

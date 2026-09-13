import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectMongoDB } from './db/connectMongoDB.js';
import { errorHandler } from './middleware/errorHandler.js';
import { NotFoundHandler } from './middleware/notFoundHandler.js';
import notesRoutes from './routes/notesRoutes.js';
import { logger } from './middleware/logger.js';



dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

app.set('json spaces', 2);

app.use(logger);

app.use(cors());
app.use(express.json());

app.use(notesRoutes);


app.use(NotFoundHandler);
app.use(errorHandler);


await connectMongoDB();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});



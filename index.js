import fs from "node:fs/promises";
import path from "node:path";

console.log(import.meta.dirname);

const carsPath = path.join(import.meta.dirname, "assets", "cars.json");
const carsData = await fs.readFile(carsPath, "utf8");

const cars = JSON.parse(carsData);

console.log(cars);

const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started on port ${PORT}`);
});


// const carsData =await fs.readFile("./assets/cars.json", "utf8");

// const cars = JSON.parse(carsData);
// console.log(typeof cars);

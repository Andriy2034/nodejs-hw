import fs from "node:fs/promises";
import path from "node:path";

console.log(import.meta.dirname);

const carsPath = path.join(import.meta.dirname, "assets", "cars.json");
const carsData = await fs.readFile(carsPath, "utf8");

const cars = JSON.parse(carsData);

console.log(cars);


// const carsData =await fs.readFile("./assets/cars.json", "utf8");

// const cars = JSON.parse(carsData);
// console.log(typeof cars);

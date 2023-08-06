import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const sever = app.listen(process.env.PORT, () => {
    console.log(`Server started on http://localhost:${process.env.PORT} !`)
})
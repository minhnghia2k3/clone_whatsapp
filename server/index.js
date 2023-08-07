import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import AuthRoutes from "./routes/AuthRoutes.js"

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
// Router
app.use('/api/auth', AuthRoutes) // /api/auth/check-user

const sever = app.listen(process.env.PORT, () => {
    console.log(`Server started on http://localhost:${process.env.PORT} !`)
})
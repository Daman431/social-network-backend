import 'dotenv/config';
import express from "express";
import userRouter from "./components/user/user.controller";
import cookieParser from "cookie-parser";
import { connectToDB } from "./db/connection";
import postRouter from './components/post/post.controller';
import cors from 'cors';

const app = express();
const port = process.env.PORT;
connectToDB();
// To parse the json body throughout the app
app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use("/user",userRouter);
app.use("/post",postRouter)
app.get("/",(req,res) => {
    res.send("Route is active!");
})
app.listen(port,() => {
    console.log(`The app is running on http://localhost:${port}`);
})
import 'dotenv/config';
import express from "express";
import userRouter from "./components/user/user.controller";
import { connectToDB } from "./db/connection";

const app = express();
const port = process.env.PORT;
connectToDB();
// To parse the json body throughout the app
app.use(express.json())
app.use("/user",userRouter);
app.get("/",(req,res) => {
    res.send("Route is active!");
})
app.listen(port,() => {
    console.log(`The app is running on http://localhost:${port}`);
})
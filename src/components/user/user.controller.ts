import express, { Request } from "express";
import { addUser, getUserById, loginUser } from "./user.service";
import { IUser } from "./user.schema";
import { LoginDto } from "../../dtos/user/login.dto";

const userRouter =  express.Router();

userRouter.get("/",(req,res) => {
    res.send("Test Route Active!")
});

userRouter.get("/:id",async (req,res) => {
    const id = req.params.id;
    const response = await getUserById(id);
    res.send(response)
})

userRouter.post("/",async (req:Request<{},{},IUser>,res) => {
    const response = await addUser(req.body);
    res.send(response);
})

userRouter.post("/login",async (req:Request<{},{},LoginDto>,res) => {
    const {username,password} = req.body;
    res.send(await loginUser(username,password));
    
})

export default userRouter;
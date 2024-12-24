import express, { Request } from "express";
import { addUser, getUserById, loginUser } from "./user.service";
import { IUser } from "./user.schema";
import { LoginDto } from "../../dtos/user/login.dto";
import { generateTokens } from "../../auth/token.helper";
import { verify } from "jsonwebtoken";
import { authMiddleware } from "../../auth/auth-guard";

const userRouter =  express.Router();
userRouter.use("/",authMiddleware)

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

userRouter.post("/refresh",async (req:Request<{},{},IUser>,res) => {
    const refreshToken = req.cookies.refreshToken;
    const user:any = verify(refreshToken,process.env.API_SECRET);
    const response = await generateTokens(user?._id);
    res.cookie("refreshToken",response.refreshToken,{secure: false,httpOnly: true});
    res.cookie("accessToken",response.accessToken,{secure: false,httpOnly: true});
    res.send(response);
})

userRouter.post("/login",async (req:Request<{},{},LoginDto>,res) => {
    const {username,password} = req.body;
    const response = await loginUser(username,password);
    if(response.data.refreshToken || response.data.accessToken){
        res.cookie("refreshToken",response.data.refreshToken,{secure: false,httpOnly: true});
        res.cookie("accessToken",response.data.accessToken,{secure: false,httpOnly: true});
    }
    res.send(response);    
})

export default userRouter;
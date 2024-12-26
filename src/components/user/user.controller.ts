import express, { Request } from "express";
import { addUser, followUser, getUserById, loginUser, setTokenCookie, unfollowUser } from "./user.service";
import { IUser } from "./user.schema";
import { LoginDto } from "../../dtos/user/login.dto";
import { generateTokens } from "../../auth/token.helper";
import { JwtPayload, verify } from "jsonwebtoken";
import { authMiddleware, unless } from "../../auth/auth-guard";
import UserModel from "./user.model";
import { plainToClass } from "class-transformer";
import { UserGetDTO } from "../../dtos/user/user-get.dto";
import { HttpResponse } from "../../types/response/HttpResponse";
import { HttpErroredResponse } from "../../types/response/HttpErroredResponse";
import { NotFoundException } from "../../types/exceptions/NotFoundException";
import mongoose, { Types } from "mongoose";

const userRouter = express.Router();
userRouter.use(unless(authMiddleware,"/login", "/"));

userRouter.get("/", (req, res) => {
    res.send("User Routes Active!");
});

userRouter.get("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const user = await getUserById(id);
        const data = plainToClass(UserGetDTO, user, { excludeExtraneousValues: true });
        const response = new HttpResponse("", data);
        res.send(response);
    }
    catch (err) {
        res.status(500).send(new HttpErroredResponse(err.message));
    }
})

userRouter.post("/", async (req: Request<{}, {}, IUser>, res) => {
    try{
        const data = await addUser(req.body);
        const response = new HttpResponse("User created successfully", data);
        res.send(response);
    }
    catch(err){
        res.status(500).send(new HttpErroredResponse(err.message));
    }
})
userRouter.post("/follow/:id",async (req,res) => {
    try{
        const followerId = new Types.ObjectId(req.params.id)
        const accessToken = req.cookies.accessToken;
        const jwtUser: JwtPayload = verify(accessToken, process.env.API_SECRET) as JwtPayload;
        if(!jwtUser?._id) throw new NotFoundException();
        const userId = new mongoose.Types.ObjectId(jwtUser._id.toString())
        const data = await followUser(followerId,userId);
        res.send(new HttpResponse("Followed successfully",data))
    }
    catch(err){
        res.status(500).send(new HttpErroredResponse(err?.message));
    }

})

userRouter.post("/unfollow/:id",async (req,res) => {
    try{
        const followerId = new Types.ObjectId(req.params.id)
        const accessToken = req.cookies.accessToken;
        const jwtUser: JwtPayload = verify(accessToken, process.env.API_SECRET) as JwtPayload;
        if(!jwtUser?._id) throw new NotFoundException();
        const userId = new mongoose.Types.ObjectId(jwtUser._id.toString())
        const data = await unfollowUser(followerId,userId);
        res.send(new HttpResponse("Followed successfully",data))
    }
    catch(err){
        res.status(500).send(new HttpErroredResponse(err?.message));
    }

})

userRouter.post("/refresh", async (req: Request<{}, {}, IUser>, res) => {
    const refreshToken = req.cookies.refreshToken;
    const jwtUser: JwtPayload = verify(refreshToken, process.env.API_SECRET) as JwtPayload;
    if (!jwtUser?._id) res.send("Invalid token");
    else {
        const user = await UserModel.findById(jwtUser._id);
        if (refreshToken == user.refreshToken) {
            const response = await generateTokens(user?._id);
            setTokenCookie(res, "refreshToken", response.refreshToken);
            setTokenCookie(res, "accessToken", response.accessToken);
            res.send(response);
        }
        else {
            res.send("Invalid token match");
        }
    }
})

userRouter.post("/login", async (req: Request<{}, {}, LoginDto>, res) => {
    const { username, password } = req.body;
    try{
        const data = await loginUser(username, password);
        if (data.refreshToken || data.accessToken) {
            setTokenCookie(res, "refreshToken", data.refreshToken);
            setTokenCookie(res, "accessToken", data.accessToken);
        }
        const response = new HttpResponse("Login successful",data);
        res.send(response);
    }
    catch(err){
        const response = new HttpErroredResponse(err.message,500);
        res.status(500).send(response)
    }
})

export default userRouter;
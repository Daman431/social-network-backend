import express, { Request } from "express";
import {
    addUser,
    blockUser,
    followUser,
    getAllUsers,
    getUserById,
    loginUser,
    setTokenCookie,
    unblockUser,
    unfollowUser,
    updateProfile,
    validateUser
} from "./user.service";
import { IUser } from "./user.schema";
import { LoginDto } from "../../dtos/user/login.dto";
import { generateTokens } from "../../auth/token.helper";
import { authMiddleware, unless, validateAccessToken } from "../../auth/auth-guard";
import UserModel from "./user.model";
import { plainToClass } from "class-transformer";
import { UserGetDTO } from "../../dtos/user/user-get.dto";
import { HttpResponse } from "../../types/response/HttpResponse";
import { HttpErroredResponse } from "../../types/response/HttpErroredResponse";
import { Types } from "mongoose";
import { UpdateUserDTO } from "../../dtos/user/user-update.dto";
import { sendErroredResponse, sendResponse } from "../common/common.service";

const userRouter = express.Router();
userRouter.use(unless(authMiddleware, "/login", "/"));

userRouter.get("/", (req, res) => {
    res.send("User Routes Active!");
});

userRouter.get("/all", async (req, res) => {
    try {
        const users = await getAllUsers();
        const data = plainToClass(UserGetDTO, users, { excludeExtraneousValues: true });
        const response = new HttpResponse("", data);
        sendResponse(res, response);
    }
    catch (err) {
        sendErroredResponse(res,err?.message)
    }
});

userRouter.get("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const user = await getUserById(id);
        const data = plainToClass(UserGetDTO, user, { excludeExtraneousValues: true });
        sendResponse(res, data);
    }
    catch (err) {
        sendErroredResponse(res,err?.message)
    }
})

userRouter.post("/", async (req: Request<{}, {}, IUser>, res) => {
    try {
        const data = await addUser(req.body);
        sendResponse(res, data,"User created successfully");
    }
    catch (err) {
        sendErroredResponse(res,err?.message)
    }
})
userRouter.post("/follow/:id", async (req, res) => {
    try {
        const followerId = new Types.ObjectId(req.params.id)
        const userId = validateUser(req);
        const data = await followUser(followerId, userId);
        sendResponse(res, data,"Followed successfully");
    }
    catch (err) {
        sendErroredResponse(res,err?.message)
    }

})

userRouter.post("/unfollow/:id", async (req, res) => {
    try {
        const followerId = new Types.ObjectId(req.params.id)
        const userId = validateUser(req);
        const data = await unfollowUser(followerId, userId);
        sendResponse(res, data,"Unfollowed successfully");
    }
    catch (err) {
        sendErroredResponse(res,err?.message)
    }
})

userRouter.post("/block/:id", async (req, res) => {
    try {
        const blockedUserId = new Types.ObjectId(req.params.id)
        const userId = validateUser(req);
        const data = await blockUser(blockedUserId, userId);
        sendResponse(res, data,"Blocked successfully");

    }
    catch (err) {
        sendErroredResponse(res,err?.message)
    }
})

userRouter.post("/unblock/:id", async (req, res) => {
    try {
        const blockedUserId = new Types.ObjectId(req.params.id)
        const userId = validateUser(req);
        const data = await unblockUser(blockedUserId, userId);
        sendResponse(res, data,"Unblocked successfully");
    }
    catch (err) {
        sendErroredResponse(res,err?.message)
    }
})

userRouter.post("/refresh", async (req: Request<{}, {}, IUser>, res) => {
    const refreshToken = req.cookies.refreshToken;
    const token = validateAccessToken(refreshToken);
    if (!token.isValid) res.send("Invalid token");
    else {
        const user = await UserModel.findById(token.data._id);
        if (refreshToken == user.refreshToken) {
            const response = await generateTokens(user?._id);
            setTokenCookie(res, "refreshToken", response.refreshToken);
            setTokenCookie(res, "accessToken", response.accessToken);
            sendResponse(res, response);
        }
        else {
            sendErroredResponse(res, "Invalid token match");
        }
    }
})

userRouter.patch<{}, {}, UpdateUserDTO>("/update", async (req, res) => {
    try {
        const body = req.body;
        const userId = validateUser(req);
        const data = await updateProfile(userId.toString(), body)
        sendResponse(res, data, "Updated profile successfully");

    }
    catch (err) {
        sendErroredResponse(res,err?.message)
    }

})

userRouter.post("/login", async (req: Request<{}, {}, LoginDto>, res) => {
    const { username, password } = req.body;
    try {
        const data = await loginUser(username, password);
        if (data.refreshToken || data.accessToken) {
            setTokenCookie(res, "refreshToken", data.refreshToken);
            setTokenCookie(res, "accessToken", data.accessToken);
        }
        sendResponse(res, data);
    }
    catch (err) {
        sendErroredResponse(res,err?.message)

    }
})

export default userRouter;
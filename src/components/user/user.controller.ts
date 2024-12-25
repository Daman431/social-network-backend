import express, { Request } from "express";
import { addUser, getUserById, loginUser, setTokenCookie } from "./user.service";
import { IUser } from "./user.schema";
import { LoginDto } from "../../dtos/user/login.dto";
import { generateTokens } from "../../auth/token.helper";
import { verify } from "jsonwebtoken";
import { authMiddleware, unless } from "../../auth/auth-guard";
import UserModel from "./user.model";
import { plainToClass } from "class-transformer";
import { UserGetDTO } from "../../dtos/user/user-get.dto";
import { HttpResponse } from "../../types/response/HttpResponse";
import { HttpErroredResponse } from "../../types/response/HttpErroredResponse";

const userRouter = express.Router();
userRouter.use(unless("/login", authMiddleware));

userRouter.get("/", (req, res) => {
    res.send("Test Route Active!");
});

userRouter.get("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const user = await getUserById(id);
        const data = plainToClass(UserGetDTO, user, { excludeExtraneousValues: true });
        const response = new HttpResponse("", true, data);
        res.send(response);
    }
    catch (err) {
        res.status(500).send(new HttpErroredResponse());
    }
})

userRouter.post("/", async (req: Request<{}, {}, IUser>, res) => {
    const response = await addUser(req.body);
    res.send(response);
})

userRouter.post("/refresh", async (req: Request<{}, {}, IUser>, res) => {
    const refreshToken = req.cookies.refreshToken;
    const jwtUser: any = verify(refreshToken, process.env.API_SECRET);
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
    const response = await loginUser(username, password);
    if (response.data.refreshToken || response.data.accessToken) {
        setTokenCookie(res, "refreshToken", response.data.refreshToken);
        setTokenCookie(res, "accessToken", response.data.accessToken);
    }
    res.send(response);
})

export default userRouter;
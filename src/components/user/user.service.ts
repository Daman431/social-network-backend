import mongoose, { model, Types } from "mongoose";
import UserCreateDto from "../../dtos/user/user-create.dto";
import UserModel from "./user.model";
import { NotFoundException } from "../../types/exceptions/NotFoundException";
import { InvalidRequestBody } from "../../types/exceptions/InvalidRequestBodyException";
import { comparePasswordWithHash } from "../../auth/password.helper";
import { generateTokens } from "../../auth/token.helper";
import { Request, Response } from "express";
import { plainToClass } from "class-transformer";
import { UserLoginDTO } from "../../dtos/user/user-login.dto";
import { UserGetDTO } from "../../dtos/user/user-get.dto";
import { ExistingException } from "../../types/exceptions/ExistingException";
import { JwtPayload, verify } from "jsonwebtoken";
import { PostGetDTO } from "../../dtos/post/post-get.dto";


const addUser = async (user: UserCreateDto) => {
    const userM = new UserModel(user);
    const existingUser = await UserModel.findOne({
        $or: [
            { userName: user.userName },
            { email: user.email }
        ]
    })
    if (existingUser) {
        throw new ExistingException("User already Exists");
    }
    await userM.save()
    const data = plainToClass(UserGetDTO, userM, { excludeExtraneousValues: true });
    return data;
}
const getUserById = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new InvalidRequestBody();
    const user = await UserModel.findById(id).populate({
        path: 'posts',
        populate: {
            path: 'comments',
            model: 'comment'
        }
    }).lean();
    const posts: any = plainToClass(PostGetDTO, user.posts, { excludeExtraneousValues: true });
    user.posts = posts
    if (!user?.email) throw new NotFoundException("User not found!")
    return user;
}

const getLoggedInUser = async (req: Request) => {
    const accessToken = req.cookies.accessToken;
    const jwtUser: JwtPayload = verify(accessToken, process.env.API_SECRET) as JwtPayload;
    if (!jwtUser?._id) throw new NotFoundException();
    return await UserModel.findById(jwtUser?._id);
}

const loginUser = async (username: string, password: string) => {
    if (!username || !password) {
        throw new InvalidRequestBody();
    }
    const user = await UserModel.findOne({ userName: username }).lean();
    if (!user) {
        throw new InvalidRequestBody();
    }
    if (user.userName == username && await comparePasswordWithHash(password, user.password)) {
        const { accessToken, refreshToken } = await generateTokens(user._id.toString());
        const modifiedUser = {
            ...user,
            accessToken,
            refreshToken
        }
        const data = plainToClass(UserLoginDTO, modifiedUser, { excludeExtraneousValues: true });
        //class transformer is overriding the _id field
        data._id = user._id.toString();
        return data;
    }
    throw new NotFoundException();
}
const followUser = async (followId: Types.ObjectId, userId: Types.ObjectId) => {
    const { followTo, isFollowed, user } = await getUserAndFollower(followId, userId);
    if (isFollowed) throw new ExistingException("Already following this user!");
    user.following.push(followId);
    followTo.followers.push(userId);
    await user.updateOne({
        following: user.following
    })
    await followTo.updateOne({
        followers: followTo.followers
    })
    return user;
}

const unfollowUser = async (followId: Types.ObjectId, userId: Types.ObjectId) => {
    const { followTo, isFollowed, user } = await getUserAndFollower(followId, userId);
    if (!isFollowed) throw new ExistingException("Not following this user!");
    user.following = user.following.filter((id) => id.toString() != followId.toString());
    followTo.followers = followTo.followers.filter((id) => id.toString() != userId.toString());
    await user.updateOne({
        following: user.following
    })
    await followTo.updateOne({
        followers: followTo.followers
    })
    return user;
}

const getUserAndFollower = async (followId: Types.ObjectId, userId: Types.ObjectId) => {
    if (followId == userId) throw new ExistingException("Invalid Id")
    const userPromise = UserModel.findOne({ _id: userId });
    const followToPromise = UserModel.findOne({ _id: followId });
    const [user, followTo] = await Promise.all([userPromise, followToPromise]);
    const isFollowed = user.following.some((id) => id.toString() == followId.toString());
    return {
        user,
        followTo,
        isFollowed
    }
}

const setTokenCookie = (res: Response, name: string, token: string) => {
    res.cookie(name, token, { secure: process.env.ENVIRONMENT == "prod", httpOnly: true });
}

export { addUser, getUserById, loginUser, setTokenCookie, followUser, unfollowUser, getLoggedInUser };
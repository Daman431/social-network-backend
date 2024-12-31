import mongoose, { Document, model, Types } from "mongoose";
import UserCreateDto from "../../dtos/user/user-create.dto";
import UserModel from "./user.model";
import { NotFoundException } from "../../types/exceptions/NotFoundException";
import { InvalidRequestException } from "../../types/exceptions/InvalidRequestBodyException";
import { comparePasswordWithHash } from "../../auth/password.helper";
import { generateTokens } from "../../auth/token.helper";
import { Request, Response } from "express";
import { plainToClass } from "class-transformer";
import { UserLoginDTO } from "../../dtos/user/user-login.dto";
import { UserGetDTO } from "../../dtos/user/user-get.dto";
import { ExistingException } from "../../types/exceptions/ExistingException";
import { PostGetDTO } from "../../dtos/post/post-get.dto";
import { validateAccessToken } from "../../auth/auth-guard";
import { IUser } from "./user.schema";
import { UpdateUserDTO } from "../../dtos/user/user-update.dto";

/**
 * 
 * @param user User DTO param
 * @returns Newly created user
 */
const addUser = async (user: UserCreateDto) => {
    const userM = new UserModel(user);
    const existingUser = await UserModel.findOne({
        $or: [
            { username: user.username },
            { email: user.email }
        ]
    })
    console.log(existingUser);
    if (existingUser) {
        throw new ExistingException("User already Exists");
    }
    await userM.save()
    const data = plainToClass(UserGetDTO, userM, { excludeExtraneousValues: true });
    return data;
}
/**
 * 
 * @returns List of users available
 */
const getAllUsers = async () => {
    const users = await UserModel.find().lean();
    return users
}
/**
 * 
 * @param id User ID
 * @returns User for the provided ID
 */
const getUserById = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new InvalidRequestException();
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
/**
 * 
 * @param req Express request param
 * @returns Logged In User
 */
const getLoggedInUser = async (req: Request) => {
    const accessToken = req.cookies.accessToken;
    const token = validateAccessToken(accessToken);
    if (!token?.data._id) throw new NotFoundException();
    return await UserModel.findById(token?.data._id);
}
/**
 * 
 * @param username Username for user login
 * @param password Password for user login
 * @returns Logged in user on sucessful
 */
const loginUser = async (username: string, password: string) => {
    if (!username || !password) {
        throw new InvalidRequestException();
    }
    const user = await UserModel.findOne({ username: username }).lean();
    if (!user) {
        throw new InvalidRequestException();
    }
    if (user.username == username && await comparePasswordWithHash(password, user.password)) {
        const { accessToken, refreshToken } = await generateTokens(user._id.toString());
        const modifiedUser = {
            ...user,
            accessToken,
            refreshToken
        }
        const data = plainToClass(UserLoginDTO, modifiedUser, { excludeExtraneousValues: true });
        return data;
    }
    throw new NotFoundException();
}
/**
 * 
 * @param followId ID for the user to follow
 * @param userId Logged In user ID
 * @returns Logged in User details
 */
const followUser = async (followId: Types.ObjectId, userId: Types.ObjectId) => {
    const { followTo, isFollowed, user } = await getUserAndFollower(followId, userId);
    if (isFollowed) throw new ExistingException("Already following this user!");
    user.following.push(followId);
    followTo.followers.push(userId);
    await user.updateOne(user)
    await followTo.updateOne(followTo)
    return user;
}
/**
 * 
 * @param followId ID for the user to follow
 * @param userId Logged In user ID
 * @returns Logged in User details
 */
const unfollowUser = async (followId: Types.ObjectId, userId: Types.ObjectId) => {
    const { followTo, isFollowed, user } = await getUserAndFollower(followId, userId);
    if (!isFollowed) throw new ExistingException("Not following this user!");
    user.following = user.following.filter((id) => id.toString() != followId.toString());
    followTo.followers = followTo.followers.filter((id) => id.toString() != userId.toString());
    await user.updateOne(user)
    await followTo.updateOne(followTo)
    return user;
}
/**
 * 
 * @param blockedUserId User ID to block
 * @param userId Logged in User ID
 * @returns Logged in User ID
 */
const blockUser = async (blockedUserId: Types.ObjectId, userId: Types.ObjectId) => {
    const { isBlocked, user } = await getUserAndblockedUser(blockedUserId, userId);
    if (isBlocked) throw new ExistingException("This user is already blocked!");
    user.blockedUsers.push(blockedUserId);
    user.following = user.following.filter(id => id.toString() != blockedUserId.toString());
    await user.updateOne(user)
    return user;
}
/**
 * 
 * @param blockedUserId User ID to block
 * @param userId Logged in User ID
 * @returns Logged in User ID
 */
const unblockUser = async (blockedUserId: Types.ObjectId, userId: Types.ObjectId) => {
    const { isBlocked, user } = await getUserAndblockedUser(blockedUserId, userId);
    if (!isBlocked) throw new ExistingException("This user is not blocked!");
    user.blockedUsers = user.blockedUsers.filter(id => id.toString() != blockedUserId.toString());
    await user.updateOne(user)
    return user;
}
/**
 * 
 * @param followId Follower User ID
 * @param userId Logged In User ID
 * @returns User and Follower details along with if the user is following or not
 */
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
/**
 * 
 * @param blockedUserId User ID to be blocked
 * @param userId Logged In User ID
 * @returns User and Blocked User details along with if the user is already blocked or not
 */
const getUserAndblockedUser = async (blockedUserId: Types.ObjectId, userId: Types.ObjectId) => {
    if (blockedUserId == userId) throw new ExistingException("Invalid Id")
    const userPromise = UserModel.findOne({ _id: userId });
    const followToPromise = UserModel.findOne({ _id: blockedUserId });
    const [user, blockedUser] = await Promise.all([userPromise, followToPromise]);
    const isBlocked = user.blockedUsers.some((id) => id.toString() == blockedUserId.toString());
    return {
        user,
        blockedUser,
        isBlocked
    }
}
/**
 * 
 * @param res Express response param
 * @param name Cookie name
 * @param token Token to be set in cookie
 */
const setTokenCookie = (res: Response, name: string, token: string) => {
    res.cookie(name, token, { secure: true, httpOnly: true, sameSite: 'none'});
}
/**
 * 
 * @param req Express request param
 * @returns User ID 
 */
const validateUser = (req: Request) => {
    const accessToken = req.cookies.accessToken;
    const token = validateAccessToken(accessToken);
    if (!token.data?._id) throw new NotFoundException();
    return new mongoose.Types.ObjectId(token.data._id.toString());
}
/**
 * 
 * @param userId User Id to be updated
 * @param updatedUser Updated User DTO
 * @returns Updated User
 */
const updateProfile = async (userId: string, updatedUser: UpdateUserDTO) => {
    let user = await UserModel.findByIdAndUpdate(userId, updatedUser, { lean: true });
    user = { ...user, ...updatedUser }
    return user;
}

export {
    addUser,
    getUserById,
    loginUser,
    setTokenCookie,
    followUser,
    unfollowUser,
    getLoggedInUser,
    blockUser,
    unblockUser,
    validateUser,
    getAllUsers,
    updateProfile
};
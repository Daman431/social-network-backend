import { Document } from "mongoose";
import UserModel from "../components/user/user.model"
import { sign } from "jsonwebtoken";
import { IUser } from "../components/user/user.schema";

export const generateRefreshToken = async (userId:string,user?:IUser):Promise<string> => {
    if(!user){
        user = await UserModel.findOne({_id: userId}).lean();
    }
    const accessToken = sign({
        _id: user._id,
        username: user.userName
    },process.env.API_SECRET, {expiresIn: '1h'});
    return accessToken;
}
export const generateAccessToken = async (userId:string,user?:IUser):Promise<string> => {
    if(!user){
        user = await UserModel.findOne({_id: userId}).lean();
    }
    const accessToken = sign({
        _id: user._id,
        username: user.userName
    },process.env.API_SECRET, {expiresIn: '1h'});
    return accessToken;
}
export const generateTokens = async (userId) => {
    const user = await UserModel.findOne({_id: userId});
    const accessToken = await generateAccessToken(userId,user)
    const refreshToken = await generateRefreshToken(userId,user);
    await user.updateOne({
        refreshToken : refreshToken
    })
    return {
        accessToken,
        refreshToken
    }
}
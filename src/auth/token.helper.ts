import UserModel from "../components/user/user.model"
import { sign } from "jsonwebtoken";
export const generateTokens = async (userId) => {
    const user = await UserModel.findOne({_id: userId});
    const accessToken = sign({
        _id: user._id,
        username: user.userName
    },process.env.API_SECRET, {expiresIn: '1h'});
    const refreshToken = sign({
        _id: user._id
    },process.env.API_SECRET, {expiresIn: '1d'})
    user.updateOne({
        refreshToken : refreshToken
    })
    return {
        accessToken,
        refreshToken
    }
}
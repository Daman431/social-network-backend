import mongoose from "mongoose";
import UserCreateDto from "../../dtos/user/user-create.dto";
import UserModel from "./user.model";
import { NotFoundException } from "../../types/exceptions/NotFoundException";
import { InvalidRequestBody } from "../../types/exceptions/InvalidRequestBodyException";
import { comparePasswordWithHash } from "../../auth/password.helper";
import { HttpResponse } from "../../types/response/HttpResponse";
import { generateTokens } from "../../auth/token.helper";


const addUser = async (user: UserCreateDto) => {
    const userM = new UserModel(user);
    return await userM.save()
}
const getUserById = async (id: string) => {
    if (!mongoose.Types.ObjectId.isValid(id)) return new InvalidRequestBody();
    const user = await UserModel.findById(id);
    if (!user.email) return new NotFoundException()
    return user;
}
const loginUser = async (username: string, password: string) => {
    const response = new HttpResponse();
    if (!username || !password) {
        response.message = new InvalidRequestBody().message;
        return response;
    }
    const user = await UserModel.findOne({ userName: username }).lean();
    if (!user) {
        response.message = new InvalidRequestBody().message;
        return response;
    }
    if (user.userName == username && await comparePasswordWithHash(password, user.password)) {
        response.message = "Login Successful";
        response.isSuccessful = true;
        const { accessToken, refreshToken } = await generateTokens(user._id);
        response.data = {
            ...user,
            accessToken,
            refreshToken
        };
        return response;
    }
    else {
        response.message = "Invalid Password";
        return response;
    }
}

export { addUser, getUserById, loginUser };
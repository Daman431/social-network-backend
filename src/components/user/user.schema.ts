import { Schema, Types } from "mongoose";
import { Gender } from "../../enums/gender/Gender";
import { ProfileStatus } from "../../enums/profileStatus/ProfileStatus";
import { generatePasswordHash } from "../../auth/password.helper";
import UserModel from "./user.model";


export interface IUser {
    firstName: string
    email: string
    mobile: string
    userName: string
    password: string
    lastName?: string
    gender?: Gender
    status?: ProfileStatus,
    refreshToken: string
    _id?: Types.ObjectId;
    followers: Types.ObjectId[]
    following: Types.ObjectId[]
}
const UserSchema = new Schema<IUser>({
    firstName: { type: String, required: true },
    mobile: { type: String, required: true },
    status: { type: String, default: "Public" },
    userName: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    followers: {type: [Types.ObjectId], default: []},
    following: {type: [Types.ObjectId], default: []},
    lastName: String,
    gender: String,
    refreshToken: String
})
UserSchema.pre("save",async function(next) {
    try{
        this.password = await generatePasswordHash(this.password);
        next();
    }
    catch(err){
        console.log(err)
        next(err);
    }
})

export default UserSchema;
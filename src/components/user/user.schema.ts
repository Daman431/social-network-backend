import { Schema, Types } from "mongoose";
import { Gender } from "../../enums/gender/Gender";
import { Status } from "../../enums/profileStatus/ProfileStatus";
import { generatePasswordHash } from "../../auth/password.helper";


export interface IUser {
    firstName: string
    email: string
    mobile: string
    userName: string
    password: string
    lastName?: string
    gender?: Gender
    status?: Status,
    refreshToken: string
    _id?: Types.ObjectId;
    posts: Types.ObjectId[]
    followers: Types.ObjectId[]
    following: Types.ObjectId[]
    blockedUsers: Types.ObjectId[]
}
const UserSchema = new Schema<IUser>({
    firstName: { type: String, required: true },
    mobile: { type: String, required: true },
    status: { type: String, enum: Status, default: Status.PUBLIC },
    userName: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    posts: {type: [Types.ObjectId], default: [], ref: "post"},
    followers: { type: [Types.ObjectId], default: [], ref: "user" },
    following: { type: [Types.ObjectId], default: [], ref: "user" },
    blockedUsers: { type: [Types.ObjectId], default: [], ref: "user" },
    lastName: String,
    gender: String,
    refreshToken: String
})
UserSchema.pre("save", async function (next) {
    try {
        this.password = await generatePasswordHash(this.password);
        next();
    }
    catch (err) {
        console.log(err)
        next(err);
    }
})

export default UserSchema;
import { Exclude, Expose, Transform } from "class-transformer";
import { Status } from "../../enums/profileStatus/ProfileStatus";
import { Types } from "mongoose";

export class PostGetDTO {
    @Expose()
    contentUrls: string[];
    @Expose()
    caption?: string
    @Expose()
    status?: Status
    @Expose()
    comments?: Types.ObjectId[]
    @Expose()
    @Transform((value) => value.obj._id.toString())
    _id?: Types.ObjectId
}
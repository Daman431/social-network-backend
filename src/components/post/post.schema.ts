import { Schema, Types } from "mongoose"
import { Status } from "../../enums/profileStatus/ProfileStatus"

export interface IPost {
    caption?: string
    contentUrls: string[]
    status?: Status
    comments?: Types.ObjectId[]
    _id?: Types.ObjectId
}
const PostSchema = new Schema<IPost>({
    caption: String,
    comments: { type: [Types.ObjectId], default: [], ref:'comment' },
    contentUrls: { type: [String], required: true },
    status: { type: String, enum: Status, default: Status.PUBLIC }
})

export default PostSchema;
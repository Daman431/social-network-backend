import { Schema, Types } from "mongoose"

export interface IComment {
    text: string
    replies: Types.ObjectId[]
    _id?: Types.ObjectId
}

const CommentSchema = new Schema<IComment>({
    replies: { type: [Types.ObjectId], default: [], ref: "comment" },
    text: { type: String, required: true }
})

export default CommentSchema;
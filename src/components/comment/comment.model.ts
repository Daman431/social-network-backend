import { model } from "mongoose";
import CommentSchema from "./comment.schema";
const CommentModel = model('comment',CommentSchema);
export default CommentModel;
import { model } from "mongoose";
import PostSchema from "./post.schema";
const PostModel = model('post',PostSchema);
export default PostModel;
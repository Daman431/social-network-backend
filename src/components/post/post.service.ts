import { Document } from "mongoose";
import PostCreateDTO from "../../dtos/post/post-create.dto";
import { IUser } from "../user/user.schema";
import PostModel from "./post.model";
import { plainToClass } from "class-transformer";
import { PostGetDTO } from "../../dtos/post/post-get.dto";

const createPost = async (postBody: PostCreateDTO, author: Document & IUser) => {
    const post = await new PostModel(postBody).save();
    author.posts.push(post._id)
    await author.updateOne({
        posts: author.posts
    })
    return post;
}

const getPostById = async (id: string) => {
    const post = await PostModel.findById(id).populate("comments").lean();
    const formattedPost = plainToClass(PostGetDTO, post, { excludeExtraneousValues: true });
    return formattedPost;
}

export { createPost, getPostById }
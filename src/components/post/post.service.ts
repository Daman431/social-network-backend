import { Document, Types } from "mongoose";
import PostCreateDTO from "../../dtos/post/post-create.dto";
import { IUser } from "../user/user.schema";
import PostModel from "./post.model";
import { plainToClass } from "class-transformer";
import { PostGetDTO } from "../../dtos/post/post-get.dto";
import { IPost } from "./post.schema";
/**
 * 
 * @param postBody Post body
 * @param author User Mongoose Document 
 * @returns Created post
 */
const createPost = async (postBody: PostCreateDTO, author: Document & IUser) => {
    const post = await new PostModel(postBody).save();
    author.posts.push(post._id)
    await author.updateOne({
        posts: author.posts
    })
    return post;
}
/**
 * 
 * @param postId Post ID
 * @param user User Mongoose Document
 * @returns Liked post
 */
const likePost = async (postId: string, user: Document & IUser) => {
    const post = await PostModel.findById(postId);
    const isLiked = post.likes.some((id) => id.toString() == user._id.toString());
    if(isLiked) return unlikePost(post,user._id);
    post.likes.push(user._id);
    await post.updateOne(post);
    return post
}
/**
 * 
 * @param post Post mongoose document
 * @param userId Liked by user ID
 * @returns Unliked post
 */
const unlikePost = async (post: Document & IPost, userId:Types.ObjectId) => {
    post.likes = post.likes.filter(id => id.toString() != userId.toString());
    await post.updateOne(post);
    return post
}
/**
 * 
 * @param id Post ID
 * @returns Post
 */
const getPostById = async (id: string) => {
    const post = await PostModel.findById(id).populate("comments").lean();
    const formattedPost = plainToClass(PostGetDTO, post, { excludeExtraneousValues: true });
    return formattedPost;
}

export { createPost, getPostById, likePost }
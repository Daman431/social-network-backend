import { Document, Types } from "mongoose";
import PostCreateDTO from "../../dtos/post/post-create.dto";
import { IUser } from "../user/user.schema";
import PostModel from "./post.model";
import { plainToClass } from "class-transformer";
import { PostGetDTO } from "../../dtos/post/post-get.dto";
import { IPost } from "./post.schema";
import { DeleteResponse } from "../../types/response/DeleteResponse";
import { InvalidRequestException } from "../../types/exceptions/InvalidRequestBodyException";
import { PostUpdateDTO } from "../../dtos/post/post-update.dto";
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
 * @param postId ID of the post to be deleted
 * @returns Delete DTO
 */
const deletePost = async (postId: string, user: IUser & Document) => {
    try {
        const isAllowed = isCreatedByUser(postId, user);
        if (!isAllowed) return new DeleteResponse("Invalid ID passed", false)
        const data = await PostModel.deleteOne({ _id: postId });
        if (data.deletedCount > 0) {
            return new DeleteResponse("Successfully deleted!", true);
        }
        user.posts = user.posts.filter(id => id.toString() != postId);
        await user.updateOne(user);
        return new DeleteResponse("Unable to find post with the given ID!", false);
    }
    catch (err) {
        return new DeleteResponse(err.message ?? "Something went wrong!", false);
    }
}
/**
 * 
 * @param postId Post Id to be updated
 * @param user User mongoose document
 * @param postUpdateDto Post Update details
 * @returns Updated Post
 */
const editPost = async (postId: string, user: IUser & Document, postUpdateDto: PostUpdateDTO) => {
    const isAllowed = isCreatedByUser(postId, user);
    if (!isAllowed) throw new InvalidRequestException();
    const post = await PostModel.findById(postId);
    await post.updateOne(postUpdateDto)
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
    if (isLiked) return unlikePost(post, user._id);
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
const unlikePost = async (post: Document & IPost, userId: Types.ObjectId) => {
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
/**
 * 
 * @param postId Post ID to search
 * @param user User mongoose document
 * @returns Boolean
 */
const isCreatedByUser = async (postId: string, user: IUser & Document) => {
    return user.posts.some((id) => id.toString() == postId)
}

export { createPost, getPostById, likePost, deletePost, editPost, isCreatedByUser }
import PostModel from "../post/post.model";
import CommentModel from "./comment.model";

/**
 * 
 * @param postId Post ID
 * @param commentText Input text for comment
 * @returns Comment
 */
const commentOnPost = async (postId: string, commentText: string) => {
    const post = await PostModel.findById(postId);
    const comment = await new CommentModel({
        text: commentText
    }).save();
    post.comments.push(comment._id);
    await post.updateOne({
        comments: post.comments
    })
    return comment;
}
/**
 * 
 * @param commentId Comment ID
 * @param reply Reply input text
 * @returns Updated comment with replies
 */
const replyOnComment = async (commentId: string, reply: string) => {
    const comment = await getCommentById(commentId);
    const newComment = await new CommentModel({
        text: reply
    }).save()
    comment.replies.push(newComment._id);
    const response = comment.populate("replies");
    await comment.updateOne({
        replies: comment.replies
    })
    return response;
}
/**
 * 
 * @param id Comment ID
 * @returns Comment for the given ID
 */
const getCommentById = async (id: string) => {
    return await CommentModel.findById(id);
}

export { commentOnPost, getCommentById, replyOnComment }
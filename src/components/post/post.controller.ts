import express from 'express';
import { authMiddleware } from '../../auth/auth-guard';
import PostCreateDTO from '../../dtos/post/post-create.dto';
import { createPost, deletePost, editPost, getPostById, likePost } from './post.service';
import { HttpResponse } from '../../types/response/HttpResponse';
import { HttpErroredResponse } from '../../types/response/HttpErroredResponse';
import { getLoggedInUser } from '../user/user.service';
import { commentOnPost, replyOnComment } from '../comment/comment.service';
import { PostUpdateDTO } from '../../dtos/post/post-update.dto';
import PostModel from './post.model';
import { defaultPaginationValues, IPaginationRequest } from '../../types/pagination/pagination';
import { plainToClass } from 'class-transformer';
import { PostFeedDto } from '../../dtos/post/post-feed-get.dto';
import { getPaginationValues } from '../common/common.service';

const postRouter = express.Router();
postRouter.use(authMiddleware);
postRouter.get("/test", (req, res) => {
    res.send("Post routes are active!");
})
postRouter.get<{}, any, any, IPaginationRequest>("/", async (req, res) => {
    try {
        const { limit, page, skippedValues, sort } = getPaginationValues(req.query);
        const posts = await PostModel.find({}).skip(skippedValues).sort(sort).lean();
        const data: PostFeedDto = { posts, limit, page, sort }
        res.send(new HttpResponse("", data))
    }
    catch (err) {
        res.status(500).send(new HttpErroredResponse(err.message));
    }
})
postRouter.post<{}, {}, PostCreateDTO>("/", async (req, res) => {
    try {
        const postBody = req.body;
        const loggedInuser = await getLoggedInUser(req);
        const post = await createPost(postBody, loggedInuser);
        res.status(200).send(new HttpResponse("Post created successfully!", post));
    }
    catch (err) {
        res.status(500).send(new HttpErroredResponse(err.message));
    }
})
postRouter.get("/:id", async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await getPostById(postId);
        res.status(200).send(new HttpResponse(null, post));
    }
    catch (err) {
        res.status(500).send(new HttpErroredResponse(err.message))
    }
})
postRouter.post("/:id/comment", async (req, res) => {
    try {
        const comment = req.body.comment;
        const postId = req.params.id;
        const post = commentOnPost(postId, comment)
        res.status(200).send(new HttpResponse(null, post));
    }
    catch (err) {
        res.status(500).send(new HttpErroredResponse(err.message))
    }
})
postRouter.post("/:id/like", async (req, res) => {
    try {
        const loggedInUser = await getLoggedInUser(req);
        const postId = req.params.id;
        const data = await likePost(postId, loggedInUser);
        res.send(new HttpResponse("Liked post successfully", data));
    }
    catch (err) {
        res.status(500).send(new HttpErroredResponse(err.message))
    }
})
postRouter.post("/:commentId/reply", async (req, res) => {
    try {
        const comment = req.body.comment;
        const commentId = req.params.commentId;
        const post = await replyOnComment(commentId, comment)
        res.status(200).send(new HttpResponse(null, post));
    }
    catch (err) {
        res.status(500).send(new HttpErroredResponse(err.message))
    }
})
postRouter.delete("/:id", async (req, res) => {
    try {
        const loggedInUser = await getLoggedInUser(req);
        const postId = req.params.id;
        const data = await deletePost(postId, loggedInUser);
        res.status(200).send(new HttpResponse("message", data));

    }
    catch (err) {
        res.status(500).send(new HttpErroredResponse(err.message))
    }
})
postRouter.put<{ id: string }, {}, PostUpdateDTO>("/:id", async (req, res) => {
    try {
        const body = req.body;
        const loggedInUser = await getLoggedInUser(req);
        const postId = req.params.id;
        const data = await editPost(postId, loggedInUser, body);
        res.status(200).send(new HttpResponse("message", data));

    }
    catch (err) {
        res.status(500).send(new HttpErroredResponse(err.message))
    }
})

export default postRouter;
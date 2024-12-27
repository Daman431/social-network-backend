import express from 'express';
import { authMiddleware } from '../../auth/auth-guard';
import PostCreateDTO from '../../dtos/post/post-create.dto';
import { createPost, getPostById } from './post.service';
import { HttpResponse } from '../../types/response/HttpResponse';
import { HttpErroredResponse } from '../../types/response/HttpErroredResponse';
import { getLoggedInUser } from '../user/user.service';
import { commentOnPost, replyOnComment } from '../comment/comment.service';

const postRouter = express.Router();
postRouter.use(authMiddleware);
postRouter.get("/",(req,res) => {
    res.send("Post routes are active!");
})

postRouter.post<{},{},PostCreateDTO>("/",async (req,res) => {
    try{
        const postBody = req.body;
        const loggedInuser = await getLoggedInUser(req);
        const post = await createPost(postBody,loggedInuser);
        res.status(200).send(new HttpResponse("Post created successfully!",post));
    }
    catch(err){
        res.status(500).send(new HttpErroredResponse(err.message));
    }
})
postRouter.get("/:id",async (req,res) => {
    try{
        const postId = req.params.id;
        const post = await getPostById(postId);
        res.status(200).send(new HttpResponse(null,post));
    }
    catch(err){
        res.status(500).send(new HttpErroredResponse(err.message))
    }
})
postRouter.post("/:id/comment",async (req,res) => {
    try{
        const comment = req.body.comment;
        const postId = req.params.id;
        const post = commentOnPost(postId,comment)
        res.status(200).send(new HttpResponse(null,post));
    }
    catch(err){
        res.status(500).send(new HttpErroredResponse(err.message))
    }
})
postRouter.post("/:commentId/reply",async (req,res) => {
    try{
        const comment = req.body.comment;
        const commentId = req.params.commentId;
        const post = await replyOnComment(commentId,comment)
        res.status(200).send(new HttpResponse(null,post));
    }
    catch(err){
        res.status(500).send(new HttpErroredResponse(err.message))
    }
})  

export default postRouter;
import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

export const authMiddleware = (req:Request,res:Response,next:NextFunction) => {
    try{
        verify(req.cookies.accessToken,process.env.API_SECRET);
        next();
    }
    catch(err) {
        console.log(err);
        res.status(401).send("Token invalid or expired!");
    }
}
export const unless = (path, middleware) => {
    return (req, res, next) => {
        if (path === req.path) {
            return next();
        } else {
            return middleware(req, res, next);
        }
    };
};
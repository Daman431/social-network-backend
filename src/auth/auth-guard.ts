import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

export const authMiddleware = (req:Request,res:Response,next:NextFunction) => {
    const jwt:any = verify(req.cookies.accessToken,process.env.API_SECRET);
    if(jwt?.exp || jwt.exp < new Date().getTime()){
        next();
    }
    else{
        res.status(401).send("Token invalid or expired!");
    }
}
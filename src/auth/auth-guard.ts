import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { AuthUser, TokenResponse } from "../types/response/TokenResponse";
import { sendErroredResponse } from "../components/common/common.service";
/**
 * req - Express request param
 * res - Express response param
 * next - Express next function
 */
export const authMiddleware = (req:Request,res:Response,next:NextFunction) => {
    try{
        verify(req.cookies.accessToken,process.env.API_SECRET);
        next();
    }
    catch(err) {
        console.log(err);
        sendErroredResponse(res,"Token invalid or expired!",401)
    }
}
/**
 * middleware - callback function for the middleware
 * paths - paths to exclude from the middleware
 */
export const unless = (middleware,...paths) => {
    return (req, res, next) => {
        if (paths.some(path => path == req.path)) {
            return next();
        } else {
            return middleware(req, res, next);
        }
    };
};
/**
 * token - JWT string to verify
 */
export const validateAccessToken = (token:string):TokenResponse => {
    try{
        const data = verify(token,process.env.API_SECRET);
        return new TokenResponse<AuthUser>(true,data,"Token is valid");
    }
    catch (err){
        return new TokenResponse(false,err,"Token is invalid");
    }
}
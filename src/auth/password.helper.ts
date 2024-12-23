import bcrypt from "bcrypt";
import { InvalidRequestBody } from "../types/exceptions/InvalidRequestBodyException";

const saltRound = 10;
export const generatePasswordHash = async (password:string) => {
    if(!password) return new InvalidRequestBody().message;
    return await bcrypt.hash(password,saltRound);
}
export const comparePasswordWithHash = async (password:string,hash:string) => {
    if(!password || !hash) return false;
    return await bcrypt.compare(password,hash);
}
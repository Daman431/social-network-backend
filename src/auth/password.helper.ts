import bcrypt from "bcrypt";
import { InvalidRequestException } from "../types/exceptions/InvalidRequestBodyException";

const saltRound = 10;
/**
 * 
 * @param password Password text
 * @returns Encoded hash password
 */
export const generatePasswordHash = async (password:string) => {
    if(!password) return new InvalidRequestException().message;
    return await bcrypt.hash(password,saltRound);
}
/**
 * 
 * @param password Password plain text
 * @param hash Encoded password
 * @returns Password is valid or not
 */
export const comparePasswordWithHash = async (password:string,hash:string) => {
    if(!password || !hash) return false;
    return await bcrypt.compare(password,hash);
}
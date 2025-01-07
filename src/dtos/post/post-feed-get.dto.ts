import { Expose } from "class-transformer";
import { IPaginationRequest } from "../../types/pagination/pagination";
import { IPost } from "../../components/post/post.schema";

export class PostFeedDto implements IPaginationRequest{
    @Expose()
    posts: IPost[]
    @Expose()
    page: number;
    @Expose()
    limit: number;
    @Expose()
    sort: "asc" | "desc";
}
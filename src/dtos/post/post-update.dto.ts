import { Status } from "../../enums/profileStatus/ProfileStatus"

export interface PostUpdateDTO{
    caption?: string
    contentUrls: string[]
    status?: Status
}
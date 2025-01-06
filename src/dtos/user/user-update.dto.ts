import { IUser } from "../../components/user/user.schema"
import { Gender } from "../../enums/gender/Gender"
import { Status } from "../../enums/profileStatus/ProfileStatus"

export interface UpdateUserDTO extends Partial<IUser>{
    firstName: string
    email: string
    mobile: string
    lastName?: string
    gender?: Gender
    status?: Status
}
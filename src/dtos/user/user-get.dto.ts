import { Expose } from 'class-transformer';
import { ProfileStatus } from '../../enums/profileStatus/ProfileStatus';
import { Gender } from '../../enums/gender/Gender';
import { Types } from 'mongoose';

export class UserGetDTO {
  @Expose()
  firstName: string
  @Expose()
  email: string
  @Expose()
  mobile: string
  @Expose()
  userName: string
  @Expose()
  lastName?: string
  @Expose()
  gender?: Gender
  @Expose()
  status?: ProfileStatus
  @Expose()
  accessToken: string
  @Expose()
  followers: Array<Types.ObjectId>
  @Expose()
  following: Array<Types.ObjectId>

}
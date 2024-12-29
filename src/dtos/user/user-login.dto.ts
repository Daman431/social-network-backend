import { Expose, Transform } from 'class-transformer';
import { Status } from '../../enums/profileStatus/ProfileStatus';
import { Gender } from '../../enums/gender/Gender';

export class UserLoginDTO {
  @Expose()
  @Transform((value) => value.obj._id.toString())
  _id:string
  @Expose()
  firstName: string
  @Expose()
  email: string
  @Expose()
  mobile: string
  @Expose()
  username: string
  @Expose()
  lastName?: string
  @Expose()
  gender?: Gender
  @Expose()
  status?: Status
  @Expose()
  accessToken: string
  @Expose()
  refreshToken: string
}
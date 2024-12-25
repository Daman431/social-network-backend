import { Expose } from 'class-transformer';
import { ProfileStatus } from '../../enums/profileStatus/ProfileStatus';
import { Gender } from '../../enums/gender/Gender';

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
}
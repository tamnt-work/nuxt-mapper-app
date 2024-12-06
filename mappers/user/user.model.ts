import { PostModel } from '../post/post.model';
import { CommentModel } from '../comment/comment.model';


  export class UserModel {
    id?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  companyName?: string;
  address?: string;
    posts?: PostModel[];
  comments?: CommentModel[];
  
    constructor(data: Partial<UserModel> = {}) {
      Object.assign(this, data);
    }
  }
  
  export type UserPlainModel = Omit<UserModel, 'constructor'>;
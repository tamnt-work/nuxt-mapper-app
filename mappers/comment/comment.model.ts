import { UserModel } from '../user/user.model';
import { PostModel } from '../post/post.model';


  export class CommentModel {
    id!: string;
  content?: string;
  createdAt?: Date;
    author?: UserModel;
  post?: PostModel;
  
    constructor(data: Partial<CommentModel> = {}) {
      Object.assign(this, data);
    }
  }
  
  export type CommentPlainModel = Omit<CommentModel, 'constructor'>;
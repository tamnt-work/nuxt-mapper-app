import { UserModel } from '../user/user.model';
import { PostModel } from '../post/post.model';
import { CommentModel } from '../comment/comment.model';


  export class NotificationModel {
    id!: string;
  type?: string;
  message?: string;
  isRead?: boolean;
  createdAt?: Date;
    recipient?: UserModel;
  post?: PostModel;
  comment?: CommentModel;
  
    constructor(data: Partial<NotificationModel> = {}) {
      Object.assign(this, data);
    }
  }
  
  export type NotificationPlainModel = Omit<NotificationModel, 'constructor'>;
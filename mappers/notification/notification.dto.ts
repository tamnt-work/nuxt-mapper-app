import { NotificationModel, type NotificationPlainModel } from './notification.model'
import { UserDTO } from '../user/user.dto';
import { PostDTO } from '../post/post.dto';
import { CommentDTO } from '../comment/comment.dto';

  export class NotificationDTO {
    id!: string;
  notification_type?: string;
  message?: string;
  is_read?: boolean;
  created_at?: Date;
    recipient?: UserDTO;
  post?: PostDTO;
  comment?: CommentDTO;
  
    constructor(data: Partial<NotificationDTO> = {}) {
      Object.assign(this, data);
    }
  
    toModel(): NotificationModel {
      return new NotificationModel({
        id: this.id,
      type: this.notification_type,
      message: this.message,
      isRead: this.is_read,
      createdAt: this.created_at,
        recipient: this.recipient?.toModel(),
      post: this.post?.toModel(),
      comment: this.comment?.toModel(),
      });
    }
  
    toPlainModel(): NotificationPlainModel {
      return {
        id: this.id,
      type: this.notification_type,
      message: this.message,
      isRead: this.is_read,
      createdAt: this.created_at,
        recipient: this.recipient?.toPlainModel(),
      post: this.post?.toPlainModel(),
      comment: this.comment?.toPlainModel(),
      };
    }
  }
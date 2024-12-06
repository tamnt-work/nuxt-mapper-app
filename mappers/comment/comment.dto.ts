import { CommentModel, type CommentPlainModel } from './comment.model'
import { UserDTO } from '../user/user.dto';
import { PostDTO } from '../post/post.dto';

  export class CommentDTO {
    id!: string;
  content?: string;
  created_at?: Date;
    author?: UserDTO;
  post?: PostDTO;
  
    constructor(data: Partial<CommentDTO> = {}) {
      Object.assign(this, data);
    }
  
    toModel(): CommentModel {
      return new CommentModel({
        id: this.id,
      content: this.content,
      createdAt: this.created_at,
        author: this.author?.toModel(),
      post: this.post?.toModel(),
      });
    }
  
    toPlainModel(): CommentPlainModel {
      return {
        id: this.id,
      content: this.content,
      createdAt: this.created_at,
        author: this.author?.toPlainModel(),
      post: this.post?.toPlainModel(),
      };
    }
  }
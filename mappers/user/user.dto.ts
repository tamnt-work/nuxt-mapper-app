import { UserModel, type UserPlainModel } from './user.model'
import { PostDTO } from '../post/post.dto';
import { CommentDTO } from '../comment/comment.dto';

  export class UserDTO {
    id?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: { name: string }
  address?: { name: string }
    posts?: PostDTO[];
  comments?: CommentDTO[];
  
    constructor(data: Partial<UserDTO> = {}) {
      Object.assign(this, data);
    }
  
    toModel(): UserModel {
      return new UserModel({
        id: this.id,
      fullName: this.name,
      email: this.email,
      phoneNumber: this.phone,
      companyName: this.company?.name,
      address: this.address?.name,
        posts: this.posts?.map(e => e.toModel()),
      comments: this.comments?.map(e => e.toModel()),
      });
    }
  
    toPlainModel(): UserPlainModel {
      return {
        id: this.id,
      fullName: this.name,
      email: this.email,
      phoneNumber: this.phone,
      companyName: this.company?.name,
      address: this.address?.name,
        posts: this.posts?.map(e => e.toPlainModel()),
      comments: this.comments?.map(e => e.toPlainModel()),
      };
    }
  }
import { PostModel, type PostPlainModel } from './post.model'
import { UserDTO } from '../user/user.dto';

  export class PostDTO {
    id!: string;
  title?: string;
  body?: string;
    author?: UserDTO;
  
    constructor(data: Partial<PostDTO> = {}) {
      Object.assign(this, data);
    }
  
    toModel(): PostModel {
      return new PostModel({
        id: this.id,
      title: this.title,
      content: this.body,
        author: this.author?.toModel(),
      });
    }
  
    toPlainModel(): PostPlainModel {
      return {
        id: this.id,
      title: this.title,
      content: this.body,
        author: this.author?.toPlainModel(),
      };
    }
  }
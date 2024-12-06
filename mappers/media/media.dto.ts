import { MediaModel, type MediaPlainModel } from './media.model'
import { UserDTO } from '../user/user.dto';
import { PostDTO } from '../post/post.dto';

  export class MediaDTO {
    id!: string;
  url!: string;
  media_type?: string;
  size?: number;
  filename?: string;
  mime_type?: string;
  created_at?: Date;
    uploader?: UserDTO;
  post?: PostDTO;
  
    constructor(data: Partial<MediaDTO> = {}) {
      Object.assign(this, data);
    }
  
    toModel(): MediaModel {
      return new MediaModel({
        id: this.id,
      url: this.url,
      type: this.media_type,
      size: this.size,
      filename: this.filename,
      mimeType: this.mime_type,
      createdAt: this.created_at,
        uploader: this.uploader?.toModel(),
      post: this.post?.toModel(),
      });
    }
  
    toPlainModel(): MediaPlainModel {
      return {
        id: this.id,
      url: this.url,
      type: this.media_type,
      size: this.size,
      filename: this.filename,
      mimeType: this.mime_type,
      createdAt: this.created_at,
        uploader: this.uploader?.toPlainModel(),
      post: this.post?.toPlainModel(),
      };
    }
  }
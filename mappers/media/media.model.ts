import { UserModel } from '../user/user.model';
import { PostModel } from '../post/post.model';


  export class MediaModel {
    id!: string;
  url!: string;
  type?: string;
  size?: number;
  filename?: string;
  mimeType?: string;
  createdAt?: Date;
    uploader?: UserModel;
  post?: PostModel;
  
    constructor(data: Partial<MediaModel> = {}) {
      Object.assign(this, data);
    }
  }
  
  export type MediaPlainModel = Omit<MediaModel, 'constructor'>;
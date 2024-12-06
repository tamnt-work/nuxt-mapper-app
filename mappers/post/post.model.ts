import { UserModel } from '../user/user.model';


  export class PostModel {
    id!: string;
  title?: string;
  content?: string;
    author?: UserModel;
  
    constructor(data: Partial<PostModel> = {}) {
      Object.assign(this, data);
    }
  }
  
  export type PostPlainModel = Omit<PostModel, 'constructor'>;
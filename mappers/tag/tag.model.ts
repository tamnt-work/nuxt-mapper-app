import { PostModel } from '../post/post.model';


  export class TagModel {
    id!: string;
  name?: string;
  slug?: string;
  color?: string;
    posts?: PostModel[];
  
    constructor(data: Partial<TagModel> = {}) {
      Object.assign(this, data);
    }
  }
  
  export type TagPlainModel = Omit<TagModel, 'constructor'>;
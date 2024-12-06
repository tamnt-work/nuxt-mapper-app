import { PostModel } from '../post/post.model';


  export class CategoryModel {
    id!: string;
  name?: string;
  description?: string;
  slug?: string;
    posts?: PostModel[];
  
    constructor(data: Partial<CategoryModel> = {}) {
      Object.assign(this, data);
    }
  }
  
  export type CategoryPlainModel = Omit<CategoryModel, 'constructor'>;
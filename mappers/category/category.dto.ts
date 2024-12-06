import { CategoryModel, type CategoryPlainModel } from './category.model'
import { PostDTO } from '../post/post.dto';

  export class CategoryDTO {
    id!: string;
  name?: string;
  description?: string;
  slug?: string;
    posts?: PostDTO[];
  
    constructor(data: Partial<CategoryDTO> = {}) {
      Object.assign(this, data);
    }
  
    toModel(): CategoryModel {
      return new CategoryModel({
        id: this.id,
      name: this.name,
      description: this.description,
      slug: this.slug,
        posts: this.posts?.map(e => e.toModel()),
      });
    }
  
    toPlainModel(): CategoryPlainModel {
      return {
        id: this.id,
      name: this.name,
      description: this.description,
      slug: this.slug,
        posts: this.posts?.map(e => e.toPlainModel()),
      };
    }
  }
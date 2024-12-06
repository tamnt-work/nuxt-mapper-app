import { TagModel, type TagPlainModel } from './tag.model'
import { PostDTO } from '../post/post.dto';

  export class TagDTO {
    id!: string;
  name?: string;
  slug?: string;
  color?: string;
    posts?: PostDTO[];
  
    constructor(data: Partial<TagDTO> = {}) {
      Object.assign(this, data);
    }
  
    toModel(): TagModel {
      return new TagModel({
        id: this.id,
      name: this.name,
      slug: this.slug,
      color: this.color,
        posts: this.posts?.map(e => e.toModel()),
      });
    }
  
    toPlainModel(): TagPlainModel {
      return {
        id: this.id,
      name: this.name,
      slug: this.slug,
      color: this.color,
        posts: this.posts?.map(e => e.toPlainModel()),
      };
    }
  }
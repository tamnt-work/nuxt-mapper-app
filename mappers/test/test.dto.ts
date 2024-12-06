import { TestModel, type TestPlainModel } from './test.model'
import { PostDTO } from '../post/post.dto';

  export class TestDTO {
    id!: string;
  testName!: string;
    posts?: PostDTO[];
  
    constructor(data: Partial<TestDTO> = {}) {
      Object.assign(this, data);
    }
  
    toModel(): TestModel {
      return new TestModel({
        id: this.id,
      test: this.testName,
        posts: this.posts?.map(e => e.toModel()),
      });
    }
  
    toPlainModel(): TestPlainModel {
      return {
        id: this.id,
      test: this.testName,
        posts: this.posts?.map(e => e.toPlainModel()),
      };
    }
  }
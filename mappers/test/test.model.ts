import { PostModel } from '../post/post.model';


  export class TestModel {
    id!: string;
  test!: string;
    posts?: PostModel[];
  
    constructor(data: Partial<TestModel> = {}) {
      Object.assign(this, data);
    }
  }
  
  export type TestPlainModel = Omit<TestModel, 'constructor'>;
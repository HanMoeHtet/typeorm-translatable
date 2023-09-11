import { TranslationConfig } from 'typeorm-translatable';
import { appDataSource } from './database';
import { createPostsWithDecorators } from './examples/createPostsWithDecorators';
import { getPostsWithDecorators } from './examples/getPostsWithDecorators';
import { getPostsWithDecoratorsWithRepository } from './examples/getPostsWithDecoratorsWithRepository';
import { createAndGetPostsWithDecoratorsWithRepositoryInTransaction } from './examples/createAndGetPostsWithDecoratorsWithRepositoryInTransaction';
import { getPosts } from './examples/getPosts';
import { createPosts } from './examples/createPosts';
import { MyPost } from './post/my-post';
import { getPostsWithRepository } from './examples/getPostsWithRepository';

(async () => {
  await appDataSource.initialize();

  TranslationConfig.use({
    getLocale: () => 'my',
    getEntityManager: () => appDataSource.manager,
  });

  // await createPosts();
  console.log(appDataSource.createEntityManager()=== appDataSource.getRepository(MyPost).manager)

  await getPostsWithRepository();

  const myPostRepository = appDataSource.getRepository(MyPost);
  const response = await myPostRepository.find()
  

  // await getPostsWithRepository();

  // await createPostsWithDecorators();

  // await getPostsWithDecorators();

  // await getPostsWithDecoratorsWithRepository();

  // await createAndGetPostsWithDecoratorsWithRepositoryInTransaction();

  process.exit(0);
})();

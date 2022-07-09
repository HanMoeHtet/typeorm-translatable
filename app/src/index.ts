import { TranslationConfig } from 'typeorm-translatable';
import { appDataSource } from './database';
import { createPostsWithDecorators } from './examples/createPostsWithDecorators';
import { getPostsWithDecorators } from './examples/getPostsWithDecorators';
import { getPostsWithDecoratorsWithRepository } from './examples/getPostsWithDecoratorsWithRepository';
import { createAndGetPostsWithDecoratorsWithRepositoryInTransaction } from './examples/createAndGetPostsWithDecoratorsWithRepositoryInTransaction';
import { getPosts } from './examples/getPosts';
import { createPosts } from './examples/createPosts';

(async () => {
  await appDataSource.initialize();

  TranslationConfig.use({
    getLocale: () => 'my',
    getEntityManager: () => appDataSource.manager,
  });

  await createPosts();

  await getPosts();

  // await getPostsWithRepository();

  // await createPostsWithDecorators();

  // await getPostsWithDecorators();

  // await getPostsWithDecoratorsWithRepository();

  // await createAndGetPostsWithDecoratorsWithRepositoryInTransaction();

  process.exit(0);
})();

import {
  TranslatableRepository,
  TranslationConfig,
} from 'typeorm-translatable';
import { appDataSource } from '../database';
import { Post } from '../post/post.entity';
import { logToOut } from '../utils/logToOut';

export const getPostsWithRepository = async (
  locale = TranslationConfig.getInstance().getLocale()
) => {
  let manager = appDataSource.createEntityManager();
  let postRepository = manager.getRepository(Post)

  postRepository = postRepository.extend(
    TranslatableRepository(manager, locale)
  );

  let posts = await postRepository.find();

  logToOut('posts-with-repository', posts);

  posts = posts.map(post => post.translate());

  logToOut('posts-translated-with-repository', posts);
};

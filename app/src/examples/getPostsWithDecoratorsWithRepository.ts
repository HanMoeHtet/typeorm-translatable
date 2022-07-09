import { PostWithDecorators } from './../post-with-decorators/post-with-decorators.entity';
import {
  TranslatableRepository,
  TranslationConfig,
} from 'typeorm-translatable';
import { appDataSource } from '../database';
import { logToOut } from '../utils/logToOut';

export const getPostsWithDecoratorsWithRepository = async (
  locale = TranslationConfig.getInstance().getLocale()
) => {
  let postWithDecoratorsRepository = appDataSource.getRepository(
    PostWithDecorators
  );

  postWithDecoratorsRepository = postWithDecoratorsRepository.extend(
    TranslatableRepository(postWithDecoratorsRepository.manager, locale)
  );

  let posts = await postWithDecoratorsRepository.find();

  logToOut('posts-with-decorators-with-repository', posts);

  posts = posts.map(post => post.translate());

  logToOut('posts-with-decorators-translated-with-repository', posts);
};

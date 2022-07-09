import { TranslationConfig } from 'typeorm-translatable';
import { appDataSource } from '../database';
import { PostWithDecorators } from '../post-with-decorators/post-with-decorators.entity';
import { logToOut } from '../utils/logToOut';

export const getPostsWithDecorators = async (
  locale = TranslationConfig.getInstance().getLocale()
) => {
  const postRepository = appDataSource.getRepository(PostWithDecorators);

  let posts = await postRepository
    .createQueryBuilder('post-with-decorators')
    .leftJoinAndSelect(
      'post-with-decorators.translations',
      'translation',
      `translation.locale = :locale`,
      {
        locale,
      }
    )
    .getMany();

  logToOut('posts-with-decorators', posts);

  posts = posts.map(post => post.translate());

  logToOut('posts-with-decorators-translated', posts);
};

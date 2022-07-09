import { TranslationConfig } from 'typeorm-translatable';
import { appDataSource } from '../database';
import { Post } from '../post/post.entity';
import { logToOut } from '../utils/logToOut';

export const getPosts = async (
  locale = TranslationConfig.getInstance().getLocale()
) => {
  const postRepository = appDataSource.getRepository(Post);

  let posts = await postRepository
    .createQueryBuilder('post')
    .leftJoinAndSelect(
      'post.translations',
      'translation',
      `translation.locale = :locale`,
      {
        locale,
      }
    )
    .getMany();

  logToOut('posts', posts);

  posts = posts.map(post => post.translate());

  logToOut('posts-translated', posts);
};

import { TranslationConfig } from 'typeorm-translatable';
import { appDataSource } from '../database';
import { PostWithDecorators } from '../post-with-decorators/post-with-decorators.entity';

export const createPostsWithDecorators = async () => {
  const postRepository = appDataSource.getRepository(PostWithDecorators);
  const postTranslationRepository = TranslationConfig.getTranslationRepository(
    PostWithDecorators
  );
  const PostTranslation = TranslationConfig.getTranslationEntity(
    PostWithDecorators
  );

  let post = new PostWithDecorators();
  post.title = 'This is a title';
  post.body = 'This is a post';

  post = await postRepository.save(post);

  const postTranslationMy = new PostTranslation();
  postTranslationMy.locale = 'my';
  postTranslationMy.title = 'ခေါင်းစဉ်';
  postTranslationMy.body = 'အကြောင်းအရာ';
  postTranslationMy.source = post;

  const postTranslationJa = new PostTranslation();
  postTranslationJa.locale = 'ja';
  postTranslationJa.title = 'これはタイトルです';
  postTranslationJa.body = 'これは投稿です';
  postTranslationJa.source = post;

  await postTranslationRepository.save([postTranslationMy, postTranslationJa]);
};

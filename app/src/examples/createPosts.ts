import { appDataSource } from '../database';
import { PostTranslation } from '../post/post-translation.entity';
import { Post } from '../post/post.entity';

export const createPosts = async () => {
  const postRepository = appDataSource.getRepository(Post);
  const postTranslationRepository = appDataSource.getRepository(
    PostTranslation
  );

  let post = new Post();
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

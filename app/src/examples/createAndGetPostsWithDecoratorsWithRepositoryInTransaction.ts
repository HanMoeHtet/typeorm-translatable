import { logToOut } from '../utils/logToOut';
import { PostWithDecorators } from '../post-with-decorators/post-with-decorators.entity';

import { appDataSource } from '../database';
import {
  TranslatableRepository,
  TranslationConfig,
} from 'typeorm-translatable';

export const createAndGetPostsWithDecoratorsWithRepositoryInTransaction = async () => {
  const PostTranslation = TranslationConfig.getTranslationEntity<{
    title: string;
    body: string;
  }>(PostWithDecorators);

  const post = new PostWithDecorators();
  post.title = 'This is title.';
  post.body = 'This is body.';

  const postTranslationMy = new PostTranslation();
  postTranslationMy.locale = 'my';
  postTranslationMy.title = 'ခေါင်းစဉ်';
  postTranslationMy.body = 'အကြောင်းအရာ';
  postTranslationMy.source = post;

  const postTranslationJa = new PostTranslation();
  postTranslationJa.locale = 'ja';
  postTranslationJa.title = 'これはテストです';
  postTranslationJa.body = 'これは投稿です';
  postTranslationJa.source = post;

  await appDataSource.transaction(async entityManager => {
    let postRepository = entityManager.getRepository(PostWithDecorators);

    await postRepository.save(post);
  });

  await appDataSource.transaction(async entityManager => {
    let postTranslationRepository = TranslationConfig.getTranslationRepository(
      PostWithDecorators,
      entityManager
    );

    await postTranslationRepository.save([
      postTranslationMy,
      postTranslationJa,
    ]);
  });

  let postRepository = appDataSource.getRepository(PostWithDecorators);
  postRepository = postRepository.extend(
    TranslatableRepository(postRepository.manager)
  );

  let updatedPost = await postRepository.findOneOrFail({
    where: {
      id: post.id,
    },
  });

  logToOut(
    'createAndGetPostsWithDecoratorsWithRepositoryInTransaction',
    updatedPost
  );

  updatedPost = updatedPost.translate();

  logToOut(
    'createAndGetPostsWithDecoratorsWithRepositoryInTransaction-translated',
    updatedPost
  );
};

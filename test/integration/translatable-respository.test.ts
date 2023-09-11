import { MyPost } from './../../app/src/post/my-post';
import { DataSource, In, Repository } from 'typeorm';
import { TranslatableRepository, TranslationConfig } from '../../src';
import { dataSourceOptions } from '../common/database';
import { PostTranslation } from '../common/post/post-translation.entity';
import { Post } from '../common/post/post.entity';

describe('integrate:TranslatableRepository', () => {
  let postRepository: Repository<Post>;
  let postTranslationRepository: Repository<PostTranslation>;
  let appDataSource: DataSource;

  beforeAll(async () => {
    appDataSource = new DataSource({
      ...dataSourceOptions,
      entities: [Post, PostTranslation, MyPost],
    });
    await appDataSource.initialize();

    TranslationConfig.use({
      getLocale: () => 'my',
      getEntityManager: () => appDataSource.manager,
    });
    const postManager = appDataSource.createEntityManager();
    postRepository = postManager.getRepository(Post);
    postRepository.extend(TranslatableRepository(postManager));

    postTranslationRepository = appDataSource.getRepository(PostTranslation);
  });

  it('Should create and find the entity', async () => {
    const post = new Post();
    post.title = 'This is title.';
    post.body = 'This is body.';

    await postRepository.save(post);

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

    await postTranslationRepository.save([
      postTranslationMy,
      postTranslationJa,
    ]);

    let updatedPost = await postRepository.findOneOrFail({
      where: {
        id: post.id,
      },
    });

    updatedPost = updatedPost.translate();

    expect(updatedPost.title).toBe('ခေါင်းစဉ်');
    expect(updatedPost.body).toBe('အကြောင်းအရာ');
  });

  it('Should find post with translation and myPost without translation', async () => {
    await expect(postRepository.find({})).resolves.not.toThrow();

    await expect(appDataSource.getRepository(MyPost).find({})).resolves.not.toThrow();
  });

  it('Should count', async () => {
    const count = await postRepository.count();

    expect(count).toEqual(1);
  });

  it('Should insert and find the entity', async () => {
    const title = Math.random().toString();
    const post = new Post();
    post.title = title;
    post.body = 'This is body.';
    const result = await postRepository.insert(post);

    const id = result.identifiers[0].id;

    const updatedPost = await postRepository.findOneOrFail({
      where: {
        id,
      },
    });

    expect(updatedPost.title).toBe(title);
  });

  it('Should find the entity by raw query', async () => {
    const result = await postRepository.query(
      `
      SELECT * FROM post 
      LEFT JOIN post_translation ON post.id = post_translation.sourceId AND post_translation.locale = ? LIMIT 1`,
      [TranslationConfig.getInstance().getLocale()]
    );

    expect(result[0].title).toEqual('ခေါင်းစဉ်');
  });

  it('Should remove the entity', async () => {
    let post = new Post();
    post.title = 'This is title.';
    post.body = 'This is body.';

    await postRepository.save(post);

    const postId = post.id;

    await postRepository.remove(post);

    expect(
      async () =>
        await postRepository.findOneOrFail({
          where: {
            id: postId,
          },
        })
    ).rejects.toThrow();
  });

  it('Should delete the entity', async () => {
    let post = new Post();
    post.title = 'This is title.';
    post.body = 'This is body.';

    post = await postRepository.save(post);

    await postRepository.delete({ id: post.id });

    expect(
      async () =>
        await postRepository.findOneOrFail({
          where: {
            id: post.id,
          },
        })
    ).rejects.toThrow();
  });

  it('Should update the entity', async () => {
    const post = new Post();
    post.title = 'This is title.';
    post.body = 'This is body.';

    await postRepository.save(post);

    await postRepository.update(
      {
        id: post.id,
      },
      {
        title: 'This is updated title.',
      }
    );

    const updatedPost = await postRepository.findOneOrFail({
      where: {
        id: post.id,
      },
    });

    expect(updatedPost.title).toEqual('This is updated title.');
  });

  it('Should upsert the entity', async () => {
    const post = new Post();
    post.title = 'This is title.';
    post.body = 'This is body.';

    await postRepository.save(post);

    post.title = 'This is upsert title.';

    await postRepository.upsert(post, { conflictPaths: ['id'] });

    const updatedPost = await postRepository.findOneOrFail({
      where: {
        id: post.id,
      },
    });

    expect(updatedPost.title).toEqual('This is upsert title.');
  });

  it('Should find and count', async () => {
    const post = new Post();
    post.title = 'This is title.';
    post.body = 'This is body.';

    await postRepository.save(post);

    const postTranslationMy = new PostTranslation();
    postTranslationMy.locale = 'my';
    postTranslationMy.title = 'ခေါင်းစဉ်';
    postTranslationMy.body = 'အကြောင်းအရာ';
    postTranslationMy.source = post;

    await postTranslationRepository.save([postTranslationMy]);

    const [posts, count] = await postRepository.findAndCount({
      where: {
        id: post.id,
      },
    });

    expect(count).toEqual(1);

    let resultPost = posts[0]!;

    resultPost = resultPost.translate();

    expect(resultPost.title).toBe('ခေါင်းစဉ်');
    expect(resultPost.body).toBe('အကြောင်းအရာ');
  });

  it('Should create and find the entity in transaction', async () => {
    const post = new Post();
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
      let postRepository = entityManager.getRepository(Post);

      await postRepository.save(post);
    });

    await appDataSource.transaction(async entityManager => {
      let postTranslationRepository = entityManager.getRepository(
        PostTranslation
      );

      await postTranslationRepository.save([
        postTranslationMy,
        postTranslationJa,
      ]);
    });

    const postManager = appDataSource.createEntityManager();
    let postRepository = postManager.getRepository(Post);
    postRepository = postRepository.extend(
      TranslatableRepository(postManager)
    );

    let updatedPost = await postRepository.findOneOrFail({
      where: {
        id: post.id,
      },
    });

    updatedPost = updatedPost.translate();

    expect(updatedPost.title).toBe('ခေါင်းစဉ်');
  });

  afterAll(async () => {
    const qr = appDataSource.createQueryRunner();
    await qr.dropTable(appDataSource.getMetadata(PostTranslation).tableName);
    await qr.dropTable(appDataSource.getMetadata(Post).tableName);
    await qr.release();
    await appDataSource.destroy();
  });
});

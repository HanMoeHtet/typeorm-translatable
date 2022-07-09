# TypeORM Translatable

Translation classes, utils, custom repositories and decorators for i18n in TypeORM.

# Installation

NPM
```bash
npm install typeorm-translatable
```
Yarn
```bash
yarn add typeorm-translatable
```

# Architecture

This library is not supposed to be used for adding translation columns in the same table. Instead, a separate table is used for translation. For each source/target entity (table), a translation entity (table) must be created. The source entity has One-To-Many relation with the created translation entity. (e.g `Post` has many `PostTranslation`.)

# Usage

```typescript
import { TranslatableEntity, Translation } from 'typeorm-translatable';
import { PostTranslation } from './post-translation.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Post extends TranslatableEntity<PostTranslation> {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id?: number;

  @Column('varchar')
  title?: string;

  @Column('text')
  body?: string;

  @OneToMany(
    () => PostTranslation,
    postTranslation => postTranslation.source
  )
  translations?: Translation<PostTranslation>[] | undefined;

  static translatableFields = new Set(['title', 'body']);
}
```
```typescript
import { Post } from './post.entity';
import { TranslationEntity } from 'typeorm-translatable';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class PostTranslation extends TranslationEntity<Post> {
  @Column('varchar')
  title?: string;

  @Column('text')
  body?: string;

  @ManyToOne(
    () => Post,
    post => post.translations
  )
  source?: Post | undefined;
}
```

For the target or source entity, extend `TranslatableEntity` class, add `translations` as  one-to-many relation and add  `translatableFields` static property. `translatableFields` must include fields that can be translated when using `entity.translate` method or `translateEntity` util function.

For the translation entity (table that has translations), extend `TranslationEntity` class, define translatable columns and add `source` as many-to-one relation.

Then when you retrieve data, left join translation entity.
```typescript
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
```

Output:
```json
[
  {
    "id": "1",
    "title": "This is a title",
    "body": "This is a post",
    "translations": [
      {
        "id": "1",
        "locale": "my",
        "title": "ခေါင်းစဉ်",
        "body": "အကြောင်းအရာ"
      }
    ]
  }
]
```
For the above output, You may use `entity.translate` method to replace `title` and `body` with translated values.
```typescript
posts = posts.map(post => post.translate());
```
Output:
```json
[
  {
    "id": "1",
    "title": "ခေါင်းစဉ်",
    "body": "အကြောင်းအရာ"
  }
]
```

Use `TranslationConfig` to configure default options. You can use `TranslationConfig.use` many times (except for `entitySuffix`).

```typescript
await appDataSource.initialize();

TranslationConfig.use({
  getLocale: () => 'my', // default locale that is used when translating, typically from req.locale or als.getStore().locale
  getEntityManager: () => appDataSource.manager, // only needed for using with decorators
  entitySuffix: 'Translation', // only needed for using with decorators
  shouldDelete: true, // whether or not translations should be deleted after translation
  shouldMutate: false, // whether or not given entity should be mutated after translation
});
```

# Usage for repository extension (Experimental)

This is rather overriding the repository instead of extending it. `TranslatableRepository` will override the `entityManager` of repository to left join translation entity automatically when doing select operations.

```typescript
let postRepository = appDataSource.getRepository(Post);

postRepository = postRepository.extend(
  TranslatableRepository(postRepository.manager)
);
```

Then when you query entities, just use normal repository methods.
```typescript
let posts = await postRepository.find();
```
This will output the same result as above. Also need to use `entity.translate` method for translation.

# Caveats
`TranslatableRepository.query` method will not left join. It will just execute the given query and return the result.

# Usage with decorators (Experimental)

You still need to extends the above mentioned classes.
Classes decorated with `Translatable` wil generate a translation entity automatically. Class properties decorated with `TranslatableColumn` wil generate a column in the generated translation entity.  Class property decorated with `Translations` will have one-to-many relation with the generated translation entity.

```typescript
import {
  Translatable,
  TranslatableColumn,
  TranslatableEntity,
  Translation,
  TranslationEntity,
  Translations,
} from 'typeorm-translatable';
import { Column, Entity, PrimaryGeneratedColumn, ObjectLiteral } from 'typeorm';

@Translatable()
@Entity()
export class PostWithDecorators extends TranslatableEntity<
  TranslationEntity<ObjectLiteral>
> {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id?: number;

  @TranslatableColumn()
  @Column('varchar')
  title?: string;

  @TranslatableColumn()
  @Column('text')
  body?: string;

  @Translations()
  translations?: Translation<TranslationEntity<ObjectLiteral>>[] | undefined;

  static translatableFields = new Set(['title', 'body']);
}
```
Then translation entities need to be generated and need to be added into TypeORM `dataSourceOptions.entities`. Use `TranslationConfig.generate` method to generate and get translation entities.
```typescript
entities: [
  PostWithDecorators,
  ...TranslationConfig.generate(),
],
```
You can access the generated translation entity by using `getTranslationEntity` method.
```typescript
const PostTranslation = TranslationConfig.getTranslationEntity(
  PostWithDecorators
);
```
See more examples [here](app/src/).

# API
Coming soon..., please read the source code for now :)

# Credits

- Inspired by framework [Vendure](https://github.com/vendure-ecommerce/vendure)

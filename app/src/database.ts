import { TranslationConfig } from 'typeorm-translatable';
import { DataSourceOptions, DataSource } from 'typeorm';
import { PostWithDecorators } from './post-with-decorators/post-with-decorators.entity';
import { PostTranslation } from './post/post-translation.entity';
import { Post } from './post/post.entity';

const {
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_NAME,
} = process.env;

const dataSourceOptions: DataSourceOptions = (() => {
  const commonOptions: DataSourceOptions = {
    type: 'mysql',
    host: DATABASE_HOST,
    port: parseInt(DATABASE_PORT || '3306'),
    username: DATABASE_USER,
    password: DATABASE_PASSWORD,
    database: DATABASE_NAME,
    synchronize: true,
    entities: [
      Post,
      PostTranslation,
      PostWithDecorators,
      ...TranslationConfig.generate(),
    ],
    migrations: [],
    subscribers: [],
  };

  return {
    ...commonOptions,
    logging: true,
  };
})();

export const appDataSource = new DataSource(dataSourceOptions);

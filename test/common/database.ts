import { DataSourceOptions } from 'typeorm';

const {
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_USER,
  DATABASE_PASSWORD,
  TEST_DATABASE_NAME,
} = process.env;

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: DATABASE_HOST,
  port: parseInt(DATABASE_PORT || '3306'),
  username: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: TEST_DATABASE_NAME,
  synchronize: true,
  logging: false,
};

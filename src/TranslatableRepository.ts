import { NotTranslatableException } from './exceptions';
import { TranslationConfig } from './TranslationConfig';
import {
  EntityManager,
  EntityTarget,
  QueryRunner,
  SelectQueryBuilder,
} from 'typeorm';

/**
 * Customer repository that intercepts all queries and adds translation
 * @param manager Entity manager
 * @param locale Locale to use
 * @throws {NotTranslatableException} If locale cannot be resolved
 * @returns empty object
 * @experimental All methods might not work as expected
 */
export const TranslatableRepository = (
  manager: EntityManager,
  locale?: string
) => {
  manager.createQueryBuilder = function createQueryBuilder<Entity>(
    entityClass?: EntityTarget<Entity> | QueryRunner,
    alias?: string,
    queryRunner?: QueryRunner
  ): SelectQueryBuilder<Entity> {
    const resolvedLocale =
      locale ?? TranslationConfig.getInstance().getLocale();

    if (resolvedLocale === undefined) {
      throw new NotTranslatableException('No locale specified');
    }

    if (alias) {
      return this.connection
        .createQueryBuilder(
          entityClass as EntityTarget<Entity>,
          alias,
          queryRunner || this.queryRunner
        )
        .leftJoinAndSelect(
          `${alias}.translations`,
          'translation',
          'translation.locale = :locale',
          {
            locale: resolvedLocale,
          }
        );
    } else {
      return this.connection.createQueryBuilder(
        (entityClass as QueryRunner | undefined) ||
          queryRunner ||
          this.queryRunner
      );
    }
  };

  return {};
};

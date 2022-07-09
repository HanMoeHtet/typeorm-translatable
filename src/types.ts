import {
  ColumnOptions,
  EntityManager,
  EntityOptions,
  ObjectLiteral,
  RelationOptions,
} from 'typeorm';
import { TranslatableEntity } from './TranslatableEntity';
import { ITranslationEntity, TranslationEntity } from './TranslationEntity';

export interface ITranslationOptions {
  /**
   * Where or not translations filed in the entity should be deleted
   * @default true
   */
  shouldDelete?: boolean;
  /**
   * Where or not the entity should be mutated when translating
   * @default false
   */
  shouldMutate?: boolean;
}

export type Translation<T> = ITranslationEntity<T> & Partial<T>;

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface ITranslationMetaDataArgsStorage {
  translatableTables: {
    target: Function;
    options?: EntityOptions;
  }[];
  translatableColumns: {
    target: object;
    propertyName: string;
    options?: ColumnOptions;
  }[];
  translationsOneToManyRelations: {
    target: object;
    propertyName: string;
    options?: RelationOptions;
  }[];
}

export interface ITranslationConfig extends ITranslationOptions {
  /**
   * Get locale, typically from request or execution context
   * e.g. req.locale or als.getStore().locale
   */
  getLocale: () => string | undefined;

  shouldDelete: boolean;

  shouldMutate: boolean;
  /**
   * Get entity manager, typically from transaction or execution context
   * e.g. transaction.manager or als.getStore().entityManager
   */
  getEntityManager: () => EntityManager | undefined;
  /**
   * Translation entity name suffix, don't be confused with table name suffix.
   * @default 'Translation'
   */
  entitySuffix: string;
  /**
   * Store translation metadata args
   * TODO: remove the storage and build the entity when decorator is called
   * @experimental
   */
  getTranslationMetadataArgsStorage: () => ITranslationMetaDataArgsStorage;

  /**
   * Store generated translation entities
   * @experimental
   */
  getTranslationEntities: () => {
    new (): TranslationEntity<TranslatableEntity<ObjectLiteral>>;
  }[];
}

export interface IConfigurableTranslationConfig
  extends Partial<
    Pick<
      ITranslationConfig,
      | 'entitySuffix'
      | 'getLocale'
      | 'shouldDelete'
      | 'shouldMutate'
      | 'getEntityManager'
    >
  > {}

export interface TranslationEntityConstructor<
  P extends ObjectLiteral,
  T extends ObjectLiteral
> {
  new (): TranslationEntity<TranslatableEntity<T>> & Partial<P>;
}

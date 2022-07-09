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
  shouldDelete?: boolean;
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
  getLocale: () => string | undefined;
  shouldDelete: boolean;
  shouldMutate: boolean;
  getEntityManager: () => EntityManager | undefined;
  entitySuffix: string;
  getTranslationMetadataArgsStorage: () => ITranslationMetaDataArgsStorage;
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

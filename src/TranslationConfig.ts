import {
  Column,
  Entity,
  EntityManager,
  EntityTarget,
  getMetadataArgsStorage,
  ManyToOne,
  ObjectLiteral,
  OneToMany,
} from 'typeorm';
import {
  AlreadyGeneratedException,
  EntityManagerNotFoundException,
  TranslationEntityNotFoundException,
} from './exceptions';
import { TranslatableEntity } from './TranslatableEntity';
import { TranslationEntity } from './TranslationEntity';
import {
  IConfigurableTranslationConfig,
  ITranslationConfig,
  ITranslationMetaDataArgsStorage,
  TranslationEntityConstructor,
} from './types';

export class TranslationConfig implements ITranslationConfig {
  getLocale: () => string | undefined = () => undefined;

  private _shouldDelete = true;

  get shouldDelete() {
    return this._shouldDelete;
  }

  private _shouldMutate: boolean = false;

  get shouldMutate() {
    return this._shouldMutate;
  }

  private _entitySuffix: string = 'Translation';

  get entitySuffix() {
    return this._entitySuffix;
  }

  private _translationMetadataArgsStorage: ITranslationMetaDataArgsStorage = {
    translatableTables: [],
    translatableColumns: [],
    translationsOneToManyRelations: [],
  };

  getTranslationMetadataArgsStorage() {
    return this._translationMetadataArgsStorage;
  }

  private _translationEntitiesMap: Map<
    Function | string,
    { new (): TranslationEntity<TranslatableEntity<ObjectLiteral>> }
  > = new Map();

  getTranslationEntities() {
    return Array.from(this._translationEntitiesMap.values());
  }

  getEntityManager: () => EntityManager | undefined = () => undefined;

  /**
   * Use provided translation config
   * @param config Config to initialize
   * @throws {AlreadyGeneratedException} when trying to change entitySuffix after translation entities are already generated
   */
  static use(config: IConfigurableTranslationConfig): void {
    const {
      getLocale,
      shouldDelete,
      shouldMutate,
      entitySuffix,
      getEntityManager,
    } = config;

    if (getLocale !== undefined) {
      this._instance.getLocale = getLocale;
    }

    if (shouldDelete !== undefined) {
      this._instance._shouldDelete = shouldDelete;
    }

    if (shouldMutate !== undefined) {
      this._instance._shouldMutate = shouldMutate;
    }

    if (entitySuffix !== undefined) {
      if (this._instance.hasGenerated) {
        throw new AlreadyGeneratedException(
          'Cannot change entity suffix after translation entities are generated.'
        );
      }
      this._instance._entitySuffix = entitySuffix;
    }

    if (getEntityManager !== undefined) {
      this._instance.getEntityManager = getEntityManager;
    }
  }

  private static _instance: TranslationConfig = new TranslationConfig();

  static getInstance(): TranslationConfig {
    return this._instance;
  }

  /**
   * Whether or not translation entities are already generated
   */
  private hasGenerated = false;

  /**
   * Generate translation entities for usage with decorators
   * @throws {AlreadyGeneratedException} when trying to generate translation entities again
   * @returns generated translation entities
   * @experimental
   */
  static generate() {
    if (this._instance.hasGenerated) {
      throw new AlreadyGeneratedException(
        'Translation entities are already generated.'
      );
    }

    const {
      translatableTables,
      translatableColumns,
      translationsOneToManyRelations,
    } = this._instance._translationMetadataArgsStorage;

    translatableTables.forEach(({ target, options }) => {
      const tableColumns = translatableColumns.filter(
        column => column.target === target
      );

      const SourceClass =
        typeof target === 'string' ? TranslatableEntity : target;

      class GeneratedTranslatableEntity extends TranslationEntity<
        TranslatableEntity<ObjectLiteral>
      > {
        @ManyToOne(
          () => SourceClass,
          (source: any) => source.translations
        )
        source?: any | undefined;
      }

      Object.defineProperty(GeneratedTranslatableEntity, 'name', {
        value: `${typeof target === 'string' ? target : target.name}${
          this._instance._entitySuffix
        }`,
        writable: false,
      });

      Entity(options)(GeneratedTranslatableEntity);

      tableColumns.forEach(({ target, propertyName, options }) => {
        const sourceColumn = getMetadataArgsStorage().columns.find(
          column =>
            column.target === target && column.propertyName === propertyName
        );

        const SourceClass = target as typeof TranslatableEntity;

        SourceClass.translatableFields.add(propertyName);

        Column({
          ...options,
          type: options?.type || sourceColumn?.options.type,
        })(new GeneratedTranslatableEntity(), propertyName);
      });

      const tableOneToManyRelations = translationsOneToManyRelations.filter(
        relation => relation.target.constructor === target
      );

      tableOneToManyRelations.forEach(({ target, propertyName, options }) => {
        OneToMany(
          () => GeneratedTranslatableEntity,
          translation => translation.source,
          options
        )(target, propertyName);
      });

      this._instance._translationEntitiesMap.set(
        target,
        GeneratedTranslatableEntity
      );
    });

    this._instance.hasGenerated = true;

    return this._instance.getTranslationEntities();
  }

  /**
   * Get respective translation entity repository for given entity
   * @param target entity to get translation entity for
   * @param manager entity manager to get translation entity repository, if not provided, will try to get from default config
   * @returns translation entity repository
   * @experimental
   */
  static getTranslationRepository<T extends ObjectLiteral>(
    target: EntityTarget<TranslatableEntity<TranslationEntity<T>>>,
    manager?: EntityManager
  ) {
    manager = this.getResolvedManager(manager);

    return manager.getRepository<TranslationEntity<TranslatableEntity<T>>>(
      this.getTranslationEntity(target)
    );
  }

  /**
   * Get respective translation entity for given entity
   * @param target entity to get translation entity for
   * @param manager entity manager to get translation entity, if not provided, will try to get from default config
   * @returns translation entity
   * @experimental
   */
  static getTranslationEntity<
    P extends ObjectLiteral = ObjectLiteral,
    T extends ObjectLiteral = ObjectLiteral
  >(
    target: EntityTarget<TranslatableEntity<TranslationEntity<T>>>,
    manager?: EntityManager
  ) {
    manager = this.getResolvedManager(manager);

    const TranslationEntity = this._instance._translationEntitiesMap.get(
      manager.connection.getMetadata(target).target
    );

    if (!TranslationEntity) {
      throw new TranslationEntityNotFoundException(
        'Could not find translation entity for entity' + target
      );
    }

    return TranslationEntity as TranslationEntityConstructor<P, T>;
  }

  private static getResolvedManager(manager?: EntityManager) {
    manager = manager || this._instance.getEntityManager();

    if (!manager) {
      throw new EntityManagerNotFoundException(
        'Could not resolve entity manager. Provide in the function call or set default in config.'
      );
    }

    return manager;
  }
}

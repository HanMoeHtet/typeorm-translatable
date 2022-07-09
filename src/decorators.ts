import { ColumnOptions, EntityOptions, RelationOptions } from 'typeorm';
import { TranslationConfig } from './TranslationConfig';

/**
 * Create a translation entity for the target entity
 * @experimental
 */
export const Translatable = (options?: EntityOptions): ClassDecorator => {
  return target => {
    TranslationConfig.getInstance()
      .getTranslationMetadataArgsStorage()
      .translatableTables.push({
        target,
        options,
      });
  };
};

/**
 * Create a column in translation entity of the target entity and put the property name in the `translatableFields` of source entity.
 * @experimental
 */
export const TranslatableColumn = (
  options?: ColumnOptions
): PropertyDecorator => {
  return (target, propertyName) => {
    TranslationConfig.getInstance()
      .getTranslationMetadataArgsStorage()
      .translatableColumns.push({
        target: target.constructor,
        propertyName: propertyName.toString(),
        options,
      });
  };
};

/**
 * Create a one-to-many relation between translation entity and target entity.
 * @experimental
 */
export const Translations = (options?: RelationOptions): PropertyDecorator => {
  return (target, propertyName) => {
    TranslationConfig.getInstance()
      .getTranslationMetadataArgsStorage()
      .translationsOneToManyRelations.push({
        target,
        propertyName: propertyName.toString(),
        options,
      });
  };
};

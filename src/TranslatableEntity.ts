import { ITranslationOptions, Translation } from './types';
import { translateEntity } from './utils';

export interface ITranslatable<T> {
  /**
   * Translations array
   */
  translations?: Partial<T>[];
  /**
   * Translate the entity by replacing fields in entity with their respective fields in {@link TranslatableEntity#translations}
   * @param locale Locale to translate to
   * @param options Options to control behavior of translation
   * @throws {NotTranslatableException} If entity is not translatable
   * @returns Translated entity
   */
  translate(locale?: string, options?: ITranslationOptions): this;
}

/**
 * Entity that can be translated
 */
export abstract class TranslatableEntity<T> implements ITranslatable<T> {
  abstract translations?: Translation<T>[];

  /**
   * Translatable fields in the entity which translations of those exist in translation table
   */
  static translatableFields: Set<string>;

  translate(locale?: string, options?: ITranslationOptions): this {
    return translateEntity(this, locale, options);
  }
}

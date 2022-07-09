import { ObjectLiteral } from 'typeorm';
import { TranslationConfig } from './TranslationConfig';
import { TranslatableEntity } from './TranslatableEntity';
import { ITranslationEntity } from './TranslationEntity';
import { ITranslationOptions, Translation } from './types';
import { NotTranslatableException } from './exceptions';

/**
 * Get translatable fields from translatable entity
 */
export const getTranslatableFields = <T>(
  entity: TranslatableEntity<T>
): Set<string> | undefined => {
  return (entity.constructor as typeof TranslatableEntity).translatableFields;
};

export const isTranslation = (
  translation: unknown
): translation is Translation<unknown> => {
  if (
    typeof translation === 'object' &&
    translation !== null &&
    'locale' in translation
  ) {
    return true;
  }

  return false;
};

/**
 * Check if an entity is translatable or not
 * @param entity Entity to check
 * @returns True if entity is translatable, false otherwise
 */
export const isTranslatable = (
  entity: TranslatableEntity<ObjectLiteral>
): entity is TranslatableEntity<ITranslationEntity<ObjectLiteral>> => {
  if (entity.translations === undefined || entity.translations.length === 0) {
    return false;
  }

  for (const translation of entity.translations) {
    if (!isTranslation(translation)) {
      return false;
    }
  }

  return true;
};

/**
 * Translate the entity to the given locale
 * @param entity The entity to translate
 * @param locale The locale to translate
 * @param options Translation options
 * @throws {NotTranslatableException} If entity is not translatable
 * @returns Translated entity
 */
export const translateEntity = <
  T extends TranslatableEntity<ITranslationEntity<ObjectLiteral>>
>(
  entity: T,
  locale = TranslationConfig.getInstance().getLocale(),
  {
    shouldDelete = TranslationConfig.getInstance().shouldDelete,
    shouldMutate = TranslationConfig.getInstance().shouldMutate,
  }: ITranslationOptions = {}
) => {
  if (!isTranslatable(entity)) {
    throw new NotTranslatableException('Entity is not translatable.');
  }

  let translatedEntity: T;

  if (shouldMutate) {
    translatedEntity = entity;
  } else {
    translatedEntity = Object.create(
      Object.getPrototypeOf(entity),
      Object.getOwnPropertyDescriptors(entity)
    );
  }

  const translation = translatedEntity.translations?.find(
    t => t.locale === locale
  );

  if (shouldDelete) {
    if (shouldMutate) {
      delete entity.translations;
    }
    delete translatedEntity.translations;
  }

  if (translation === undefined) {
    return translatedEntity;
  }

  Object.keys(translatedEntity).forEach(key => {
    const translatableFields = getTranslatableFields(translatedEntity);

    if (translatableFields === undefined) {
      throw new NotTranslatableException('Entity has to translatable fields.');
    }

    if (translatableFields.has(key)) {
      const translatedValue = translation[
        key as keyof ITranslationEntity<T>
      ] as string;

      translatedEntity[
        key as keyof TranslatableEntity<T>
      ] = translatedValue as any;
    }
  });

  return translatedEntity;
};

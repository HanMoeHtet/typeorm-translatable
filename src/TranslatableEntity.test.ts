import { NotTranslatableException } from './exceptions';
import { TranslatableEntity } from './TranslatableEntity';
import { TranslationConfig } from './TranslationConfig';
import { TranslationEntity } from './TranslationEntity';
import { Translation } from './types';

describe('TranslatableEntity', () => {
  class UserTranslation extends TranslationEntity<User> {
    name?: string;

    source?: User | undefined;
  }

  class User extends TranslatableEntity<UserTranslation> {
    name?: string;

    translations?: Translation<UserTranslation>[] | undefined;

    static translatableFields = new Set(['name']);
  }

  class UserWithoutTranslatableFields extends TranslatableEntity<
    UserTranslation
  > {
    name?: string;

    translations?: Translation<UserTranslation>[] | undefined;
  }

  const myTranslation = new UserTranslation();
  Object.assign(myTranslation, { locale: 'my', name: 'မင်္ဂလာပါ' });

  const jaTranslation = new UserTranslation();
  Object.assign(jaTranslation, { locale: 'ja', name: 'こんにちは' });

  beforeAll(() => {
    TranslationConfig.use({
      getLocale: () => 'my',
    });
  });

  it('translateEntity on entity should return translated entity', () => {
    const entity = new User();
    entity.name = 'Hello';
    entity.translations = [myTranslation];

    const translatedEntity = entity.translate();

    expect(translatedEntity.name).toEqual('မင်္ဂလာပါ');
  });

  it('translateEntity with locale on entity should return translated entity', () => {
    const entity = new User();
    entity.name = 'Hello';
    entity.translations = [myTranslation, jaTranslation];

    const translatedEntity = entity.translate('ja');

    expect(translatedEntity.name).toEqual('こんにちは');
  });

  it('translateEntity with unavailable locale on entity should return entity', () => {
    const entity = new User();
    entity.name = 'Hello';
    entity.translations = [myTranslation, jaTranslation];

    const translatedEntity = entity.translate('ch');

    expect(translatedEntity.name).toEqual(entity.name);
  });

  it('translateEntity on entity should delete translations, should not mutate by default', () => {
    const entity = new User();
    entity.name = 'Hello';
    entity.translations = [myTranslation];

    const translatedEntity = entity.translate();

    expect(entity.name).toEqual('Hello');

    expect(entity.translations).not.toEqual(undefined);

    expect(translatedEntity.translations).toEqual(undefined);
  });

  it('translateEntity on entity should delete translations, should mutate', () => {
    const entity = new User();
    entity.name = 'Hello';
    entity.translations = [myTranslation];

    const translatedEntity = entity.translate(undefined, {
      shouldMutate: true,
    });

    expect(entity.name).toEqual(translatedEntity.name);

    expect(entity.translations).toEqual(undefined);

    expect(translatedEntity.translations).toEqual(undefined);
  });

  it('translateEntity on entity should not delete translations, should mutate', () => {
    const entity = new User();
    entity.name = 'Hello';
    entity.translations = [myTranslation];

    const translatedEntity = entity.translate(undefined, {
      shouldDelete: false,
      shouldMutate: true,
    });

    expect(entity.name).toEqual(translatedEntity.name);

    expect(entity.translations).not.toEqual(undefined);

    expect(translatedEntity.translations).not.toEqual(undefined);
  });

  it('translateEntity on not translatable entity should throw error', () => {
    const entity = new User();
    entity.name = 'Hello';
    entity.translations = [{ name: 'မင်္ဂလာပါ' }];

    expect(() => {
      entity.translate();
    }).toThrowError(NotTranslatableException);
  });

  it('translateEntity on not translatable entity should throw error', () => {
    const entity = new UserWithoutTranslatableFields();
    entity.name = 'Hello';
    entity.translations = [myTranslation];

    expect(() => {
      entity.translate();
    }).toThrowError(NotTranslatableException);
  });
});

import { NotTranslatableException } from './exceptions';
import { TranslationConfig } from './TranslationConfig';
import { TranslationEntity } from './TranslationEntity';
import { TranslatableEntity } from './TranslatableEntity';
import {
  getTranslatableFields,
  isTranslatable,
  translateEntity,
} from './utils';
import { Translation } from './types';

const SAMPLE_TRANSLATABLE_FIELDS = ['title', 'body'];

describe('getTranslatableFields', () => {
  it('getTranslatableFields on object should return undefined', () => {
    const entity = {
      translatableFields: SAMPLE_TRANSLATABLE_FIELDS,
    };

    expect(getTranslatableFields(entity as any)).toEqual(undefined);
  });

  it('getTranslatableFields on object with constructor overridden should return fields', () => {
    const entity = {};

    (entity.constructor as any).translatableFields = SAMPLE_TRANSLATABLE_FIELDS;

    expect(getTranslatableFields(entity as any)).toEqual(
      SAMPLE_TRANSLATABLE_FIELDS
    );
  });

  it('getTranslatableFields on class should return fields', () => {
    const entity = new (class {
      static translatableFields = SAMPLE_TRANSLATABLE_FIELDS;
    })();

    expect(getTranslatableFields(entity as any)).toEqual(
      SAMPLE_TRANSLATABLE_FIELDS
    );
  });
});

describe('isTranslatable', () => {
  it('isTranslatable on empty should return false', () => {
    const entity = {
      translations: [],
    };

    expect(isTranslatable(entity as any)).toEqual(false);
  });

  it('isTranslatable on array with empty object should return false', () => {
    const entity = {
      translations: [{}],
    };

    expect(isTranslatable(entity as any)).toEqual(false);
  });

  it('isTranslatable on array with plain object should return false', () => {
    const entity = {
      translations: [{ name: 'test' }],
    };

    expect(isTranslatable(entity as any)).toEqual(false);
  });

  it('isTranslatable on array with object of class TranslationEntity should return true', () => {
    class SampleTranslationEntity extends TranslationEntity<{}> {
      source?: {} | undefined;
    }

    const translationEntity = new SampleTranslationEntity();
    translationEntity.locale = 'my';

    const entity = {
      translations: [translationEntity],
    };

    expect(isTranslatable(entity as any)).toEqual(true);
  });
});

describe('translateEntity', () => {
  class UserTranslation extends TranslationEntity<User> {
    name?: string;

    source?: User | undefined;
  }

  class User extends TranslatableEntity<UserTranslation> {
    name?: string;

    translations?: Translation<UserTranslation>[] | undefined;

    static translatableFields = new Set(['name']);
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

    const translatedEntity = translateEntity(entity);

    expect(translatedEntity.name).toEqual('မင်္ဂလာပါ');
  });

  it('translateEntity with locale on entity should return translated entity', () => {
    const entity = new User();
    entity.name = 'Hello';
    entity.translations = [myTranslation, jaTranslation];

    const translatedEntity = translateEntity(entity, 'ja');

    expect(translatedEntity.name).toEqual('こんにちは');
  });

  it('translateEntity with unavailable locale on entity should return entity', () => {
    const entity = new User();
    entity.name = 'Hello';
    entity.translations = [myTranslation, jaTranslation];

    const translatedEntity = translateEntity(entity, 'ch');

    expect(translatedEntity.name).toEqual(entity.name);
  });

  it('translateEntity on entity should delete translations, should not mutate by default', () => {
    const entity = new User();
    entity.name = 'Hello';
    entity.translations = [myTranslation];

    const translatedEntity = translateEntity(entity);

    expect(entity.name).toEqual('Hello');

    expect(entity.translations).not.toEqual(undefined);

    expect(translatedEntity.translations).toEqual(undefined);
  });

  it('translateEntity on entity should delete translations, should mutate', () => {
    const entity = new User();
    entity.name = 'Hello';
    entity.translations = [myTranslation];

    const translatedEntity = translateEntity(entity, undefined, {
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

    const translatedEntity = translateEntity(entity, undefined, {
      shouldDelete: false,
      shouldMutate: true,
    });

    expect(entity.name).toEqual(translatedEntity.name);

    expect(entity.translations).not.toEqual(undefined);

    expect(translatedEntity.translations).not.toEqual(undefined);
  });

  it('translateEntity on not translatable entity should throw error', () => {
    expect(() => {
      translateEntity({ translations: [] } as any);
    }).toThrowError(NotTranslatableException);

    expect(() => {
      translateEntity({ translations: [{}] } as any);
    }).toThrowError(NotTranslatableException);

    expect(() => {
      translateEntity({ translations: [{ name: 'test' }] } as any);
    }).toThrowError(NotTranslatableException);
  });
});

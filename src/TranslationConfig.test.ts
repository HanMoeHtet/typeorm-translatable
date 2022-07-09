import { AlreadyGeneratedException } from './exceptions';
import { TranslationConfig } from './TranslationConfig';

describe('TranslationConfig', () => {
  it('TranslationConfig getInstance should have configured options', () => {
    TranslationConfig.use({
      getLocale: () => 'my',
      shouldDelete: false,
      shouldMutate: true,
    });

    expect(TranslationConfig.getInstance().getLocale()).toEqual('my');
    expect(TranslationConfig.getInstance().shouldDelete).toEqual(false);
    expect(TranslationConfig.getInstance().shouldMutate).toEqual(true);
  });

  it('TranslationConfig configuring twice should override', () => {
    const entitySuffix = Math.random().toString();
    TranslationConfig.use({
      getLocale: () => 'my',
      entitySuffix,
    });

    TranslationConfig.use({
      getLocale: () => 'ja',
    });

    expect(TranslationConfig.getInstance().getLocale()).toEqual('ja');
    expect(TranslationConfig.getInstance().entitySuffix).toEqual(entitySuffix);
  });

  it('configuring entitySuffix after generating should throw error', () => {
    TranslationConfig.getInstance()['hasGenerated'] = true;

    expect(() =>
      TranslationConfig.use({
        entitySuffix: Math.random().toString(),
      })
    ).toThrowError(AlreadyGeneratedException);
  });
});

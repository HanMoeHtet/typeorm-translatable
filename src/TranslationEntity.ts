import { PrimaryGeneratedColumn, Column } from 'typeorm';

export interface ITranslationEntity<T> {
  source?: T;
  id?: string;
  locale?: string;
}

/**
 * Entity that contains translations for source entity
 */
export abstract class TranslationEntity<T> implements ITranslationEntity<T> {
  /**
   * Source entity
   */
  abstract source?: T;

  /**
   * Id of translation
   */
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id?: string;

  /**
   * Locale of translation
   */
  @Column('varchar', { length: 6 })
  locale?: string;
}

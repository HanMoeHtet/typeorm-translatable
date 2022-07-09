import { PrimaryGeneratedColumn, Column } from 'typeorm';

export interface ITranslationEntity<T> {
  /**
   * Source entity
   */
  source?: T;
  /**
   * Id of translation
   */
  id?: string;
  /**
   * Locale of translation
   */
  locale?: string;
}

/**
 * Entity that contains translations for source entity
 */
export abstract class TranslationEntity<T> implements ITranslationEntity<T> {
  abstract source?: T;

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id?: string;

  @Column('varchar', { length: 6 })
  locale?: string;
}

import {
  Translatable,
  TranslatableColumn,
  TranslatableEntity,
  Translation,
  TranslationEntity,
  Translations,
} from 'typeorm-translatable';
import { Column, Entity, PrimaryGeneratedColumn, ObjectLiteral } from 'typeorm';

@Translatable()
@Entity()
export class PostWithDecorators extends TranslatableEntity<
  TranslationEntity<ObjectLiteral>
> {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id?: number;

  @TranslatableColumn()
  @Column('varchar')
  title?: string;

  @TranslatableColumn()
  @Column('text')
  body?: string;

  @Translations()
  translations?: Translation<TranslationEntity<ObjectLiteral>>[] | undefined;

  static translatableFields = new Set(['title', 'body']);
}

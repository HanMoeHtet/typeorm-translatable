import { TranslatableEntity, Translation } from 'typeorm-translatable';
import { PostTranslation } from './post-translation.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Post extends TranslatableEntity<PostTranslation> {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id?: number;

  @Column('varchar')
  title?: string;

  @Column('text')
  body?: string;

  @OneToMany(
    () => PostTranslation,
    postTranslation => postTranslation.source
  )
  translations?: Translation<PostTranslation>[] | undefined;

  static translatableFields = new Set(['title', 'body']);
}

import { Post } from './post.entity';
import { TranslationEntity } from 'typeorm-translatable';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class PostTranslation extends TranslationEntity<Post> {
  @Column('varchar')
  title?: string;

  @Column('text')
  body?: string;

  @ManyToOne(
    () => Post,
    post => post.translations
  )
  source?: Post | undefined;
}

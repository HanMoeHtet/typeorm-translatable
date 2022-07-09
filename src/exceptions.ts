/**
 * Thrown when an entity is not translatable
 */
export class NotTranslatableException extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, NotTranslatableException.prototype);
  }
}

/**
 * Thrown when translation entities are already generated
 */
export class AlreadyGeneratedException extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, AlreadyGeneratedException.prototype);
  }
}

/**
 * Thrown when entity manager is not found
 */
export class EntityManagerNotFoundException extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, EntityManagerNotFoundException.prototype);
  }
}

/**
 * Throw when translation entity is not found
 */
export class TranslationEntityNotFoundException extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, TranslationEntityNotFoundException.prototype);
  }
}

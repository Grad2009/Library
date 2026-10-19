import {Service} from '@angular/core';

@Service()
export class IdGenerator {
  next(): string {
    return crypto.randomUUID();
  }
}

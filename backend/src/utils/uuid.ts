import { randomUUID } from 'crypto';

export function cryptoNativeUUID(): string {
  return randomUUID();
}

import { type Algorithm, hash, verify } from '@node-rs/argon2';

// `Algorithm` is an ambient const enum, which isolatedModules can't inline, so use its value.
const ARGON2ID: Algorithm = 2;

/** OWASP's baseline argon2id profile: 19 MiB memory, 2 iterations, 1 lane. */
const OPTIONS = {
  algorithm: ARGON2ID,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
};

export function hashPassword(password: string): Promise<string> {
  return hash(password, OPTIONS);
}

/** Parameters are read from the PHC string, so hashes made with older settings still verify. */
export function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  return verify(passwordHash, password);
}

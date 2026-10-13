import { describe, expect, it } from 'vitest';

import { hashPassword, verifyPassword } from './password.js';

describe('password hashing', () => {
  it('produces a salted argon2id PHC string', async () => {
    const [a, b] = await Promise.all([
      hashPassword('correct horse'),
      hashPassword('correct horse'),
    ]);

    expect(a).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
    expect(a).not.toBe(b);
  });

  it('verifies the right password and rejects a wrong one', async () => {
    const stored = await hashPassword('correct horse');

    await expect(verifyPassword(stored, 'correct horse')).resolves.toBe(true);
    await expect(verifyPassword(stored, 'battery staple')).resolves.toBe(false);
  });
});

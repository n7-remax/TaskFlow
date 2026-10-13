import * as contracts from '@taskflow/contracts';
import { describe, expect, expectTypeOf, it } from 'vitest';

import * as db from '../generated/prisma/enums.js';

describe('Prisma enums', () => {
  it('match the contracts package value for value, in order', () => {
    expect(Object.values(db.TaskStatus)).toEqual(contracts.TASK_STATUSES);
    expect(Object.values(db.Priority)).toEqual(contracts.PRIORITIES);
    expect(Object.values(db.Role)).toEqual(contracts.ROLES);
  });

  it('are assignable both ways at the type level', () => {
    expectTypeOf<db.TaskStatus>().toEqualTypeOf<contracts.TaskStatus>();
    expectTypeOf<db.Priority>().toEqualTypeOf<contracts.Priority>();
    expectTypeOf<db.Role>().toEqualTypeOf<contracts.Role>();
  });
});

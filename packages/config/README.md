# @taskflow/config

Shared tooling presets for the TaskFlow monorepo.

| Export                                     | Use                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------- |
| `@taskflow/config/tsconfig/base.json`      | strict TS defaults (bundler resolution, `noUncheckedIndexedAccess`) |
| `@taskflow/config/tsconfig/node.json`      | Node services (`apps/api`)                                          |
| `@taskflow/config/tsconfig/library.json`   | emitted libraries (`packages/contracts`)                            |
| `@taskflow/config/tsconfig/nextjs.json`    | Next.js apps (`apps/web`)                                           |
| `@taskflow/config/eslint/{base,node,next}` | ESLint flat configs                                                 |
| `@taskflow/config/prettier`                | Prettier options                                                    |

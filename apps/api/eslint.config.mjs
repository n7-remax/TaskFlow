import { node } from '@taskflow/config/eslint/node';

export default [...node, { ignores: ['src/generated/**'] }];

import { PLL_CASES } from './pll';
import { ZBLL_NON_PLL_CASES } from './zbll-cases';
import { ZBLL_MANIFEST } from './zbll-manifest';
import type { CaseEntry } from './types';

export { ZBLL_MANIFEST, ZBLL_NON_PLL_CASES };
export const ZBLL_DATASET_VERSION = 'zbll-library-v1';
// Do not export this through the production catalog before B11's semantic gate.
export const ZBLL_CASES: readonly CaseEntry[] = [...ZBLL_NON_PLL_CASES, ...PLL_CASES];

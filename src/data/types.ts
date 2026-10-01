import type { CubeStateV1 } from '../cube/engine';
import type { Move } from '../store/records';
import type { CaseTrainer, QuarterTurn } from '../cases/identity';

export interface CaseEntry {
  readonly id: string;
  readonly trainer: CaseTrainer;
  readonly label: string;
  readonly aliases: readonly string[];
  readonly family: string;
  readonly source: string;
  readonly sourceLabel: string;
  readonly datasetVersion: string;
  readonly identityPolicyVersion: string;
  readonly identityKey: string;
  readonly representative: Readonly<CubeStateV1>;
  readonly setup: readonly Readonly<Move>[];
  readonly defaultAlgorithm: readonly Readonly<Move>[];
  readonly finalAuf: QuarterTurn;
  readonly angleRule: 'four-pre-u-four-slots' | 'four-pre-u-four-proper-yaws';
}
export interface CoverageManifest {
  readonly trainer: CaseTrainer;
  readonly datasetVersion: string;
  readonly identityPolicyVersion: string;
  readonly expectedCount: number;
  readonly expectedIds: readonly string[];
  readonly solvedExcluded: true;
  readonly numberingSource: string;
}

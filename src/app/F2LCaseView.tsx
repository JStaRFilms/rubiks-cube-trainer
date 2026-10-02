import { faces } from '../cube/geometry';
import type { CubeStateV1 } from '../cube/engine';
import type { TrainingFrame } from '../store/records';
const positions = { U: [1, 0], R: [2, 1], F: [1, 1], D: [1, 2], L: [0, 1], B: [3, 1] } as const;
const palette = { white: '#ffffff', yellow: '#f7d541', red: '#d64240', orange: '#ed862f', green: '#369e64', blue: '#438adb' };
export function F2LCaseView({ state, frame, label = 'Representative isolated pair cube net. Last layer may differ on your physical cube.' }: { state: CubeStateV1; frame: TrainingFrame; label?: string }) {
  return <svg className="f2l-case-view" viewBox="0 0 120 90" role="img" aria-label={label}>
    {faces.flatMap((face, f) => Array.from({ length: 9 }, (_, cell) => {
      const label = faces.find((value) => value === state.facelets[f * 9 + cell]);
      if (!label) return null;
      return <rect key={`${face}${cell}`} x={positions[face][0] * 30 + cell % 3 * 10} y={positions[face][1] * 30 + Math.floor(cell / 3) * 10} width="9" height="9" fill={palette[frame.colorOfFace[label]]} />;
    }))}
  </svg>;
}

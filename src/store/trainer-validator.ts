import { crossClient } from '../cross/client';
import { OneClient } from '../cross-one/client';
import { LLClient } from '../ll/client';
import { F2LClient } from '../f2l/client';
import { object } from './validation';
import type { SemanticValidator } from './records';

// Validation has its own worker. Suspending generation cannot cancel a history write.
const oneValidation = new OneClient();
const f2lValidation = new F2LClient();
const llValidation = new LLClient();
let queue = Promise.resolve();
export const trainerValidator: SemanticValidator = {
  validateAttempt(value) {
    const operation = queue.then(() => {
      const trainer = object(value).trainer;
      if (trainer === 'cross') return crossClient.validator.validateAttempt(value);
      if (trainer === 'cross1') return oneValidation.validateAttempt(value);
      if (trainer === 'f2l') return f2lValidation.validateAttempt(value);
      if (trainer === 'oll' || trainer === 'pll') return llValidation.validateAttempt(value);
      throw new Error('This trainer has no compatible attempt validator.');
    });
    queue = operation.then(() => {}, () => {});
    return operation;
  },
  validateTrainingData(data, attempts, sessions) {
    const operation = queue.then(() => llValidation.validateTrainingData(data, attempts, sessions));
    queue = operation.then(() => {}, () => {});
    return operation;
  },
};

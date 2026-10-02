import { crossClient } from '../cross/client';
import { OneClient } from '../cross-one/client';
import { F2LClient } from '../f2l/client';
import { object } from './validation';
import type { SemanticValidator } from './records';

// Validation has its own worker. Suspending generation cannot cancel a history write.
const oneValidation = new OneClient();
const f2lValidation = new F2LClient();
let queue = Promise.resolve();
export const trainerValidator: SemanticValidator = {
  validateAttempt(value) {
    const operation = queue.then(() => {
      const trainer = object(value).trainer;
      if (trainer === 'cross') return crossClient.validator.validateAttempt(value);
      if (trainer === 'cross1') return oneValidation.validateAttempt(value);
      if (trainer === 'f2l') return f2lValidation.validateAttempt(value);
      throw new Error('Only Cross, Cross+1 and F2L attempts are supported.');
    });
    queue = operation.then(() => {}, () => {});
    return operation;
  },
  validateTrainingData(data) {
    const operation = queue.then(() => f2lValidation.validateTrainingData(data));
    queue = operation.then(() => {}, () => {});
    return operation;
  },
};

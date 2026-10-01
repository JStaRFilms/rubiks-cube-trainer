import { crossClient } from '../cross/client';
import { OneClient } from '../cross-one/client';
import { object } from './validation';
import type { SemanticValidator } from './records';

// Validation has its own worker. Suspending generation cannot cancel a history write.
const oneValidation = new OneClient();
let queue = Promise.resolve();
export const trainerValidator: SemanticValidator = {
  validateAttempt(value) {
    const operation = queue.then(() => {
      const trainer = object(value).trainer;
      if (trainer === 'cross') return crossClient.validator.validateAttempt(value);
      if (trainer === 'cross1') return oneValidation.validateAttempt(value);
      throw new Error('Only Cross and Cross+1 attempts are supported.');
    });
    queue = operation.then(() => {}, () => {});
    return operation;
  },
  validateTrainingData: crossClient.validator.validateTrainingData,
};

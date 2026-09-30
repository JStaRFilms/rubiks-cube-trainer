import { PwaController } from '../../src/pwa/client';
import { activityStore, enterActivity, lockUpdate, releaseUpdate } from '../../src/pwa/activity';
import { Repository } from '../../src/store/repository';
const repository = new Repository();
const controller = new PwaController(() => {}, () => repository.probe());
export const contract = { controller, enterActivity, lockUpdate, releaseUpdate, state: activityStore.getState, ready: controller.start() };
declare global { interface Window { foundationContract: typeof contract; pwaListeners: { type: string; listener: EventListenerOrEventListenerObject; options?: boolean | AddEventListenerOptions }[] } }
window.foundationContract = contract;

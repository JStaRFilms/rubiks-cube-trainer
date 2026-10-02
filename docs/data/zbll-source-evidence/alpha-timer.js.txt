class TimerController {
  /** @ngInject */
  constructor($scope, $document, $interval) {
    this.time = 0;
    this.startTime = 0;
    this.running = false;
    this.justStopped = false;

    $document.on('keydown', (event) => {this.handleKeyDown(event)});
    $document.on('keyup', (event) => {this.handleKeyUp(event)});

    $scope.$on('$destroy', () => {
      $document.off('keydown');
      $document.off('keyup');
    })

    $interval(() => {this.update()}, 30)
  }

  update() {
    if (this.running) {
      let time = (new Date().getTime()) / 1000;
      this.time = time - this.startTime;
    }
  }

  startTimer() {
    if (!this.justStopped & !this.running) {
      console.log('starting');
      this.running = true;
      this.startTime = (new Date().getTime()) / 1000;
    }
    this.justStopped = false;
  }

  stopTimer() {
    if (this.running) {
      console.log('stop');
      let time = (new Date().getTime()) / 1000;
      this.running = false;
      this.time = (time - this.startTime);
      this.justStopped = true;
    }
    else {
      this.time = 0;
    }
  }

  handleKeyDown(event) {
    switch (event.code) {
      case 'Space':
        this.stopTimer();
        event.preventDefault()
        break;
      default:
    }
  }

  handleKeyUp(event) {
    switch (event.code) {
      case 'Space':
        this.startTimer();
        event.preventDefault()
        break;
      default:
    }
  }
}

export const timer = {
  template: require('./timer.html'),
  controller: TimerController,
  controllerAs: 'ctrl'
};

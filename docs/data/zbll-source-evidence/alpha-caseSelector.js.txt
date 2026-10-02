import './caseSelector.css'

class CaseSelectorController {
  /** @ngInject */
  constructor($http) {
    this.selected = {"0F-0321":true,"0F-1023":true,"0F-1230":true,"00-0231":true,"00-0312":true,"00-1032":true,"00-2301":true,"H0-0123":true,"H0-0231":true,"H0-0312":true,"H0-1032":true,"H0-1203":true,"H0-2013":true,"H0-2301":true,"H0-3210":true};
    this.cases = {};

    this.showOCLL = '0';
    this.showCOLL = '00';

    $http.get('app/caseSelector/zblls.json')
      .then(response => {
        this.cases = response.data;
      });
  }

  getOCLLs() {
    return Object.keys(this.cases).sort();
  }

  getCOLLs(ocll) {
    return Object.keys(this.cases[ocll]).sort();
  }

  getZBLLs(coll) {
    let ocll = coll[0];
    if (this.cases[ocll])
      return this.cases[ocll][coll].sort();
    else
      return [];
  }

  toggleOCLL(ocll) {
    this.showOCLL = ocll;
    this.showCOLL = ocll + '0';
  }

  toggleCOLL(coll) {
    this.showOCLL = coll[0];
    this.showCOLL = coll;
  }

  getSelectedCount(coll) {
    let count = 0;
    for (let zbll in this.selected) {
      let thisColl = zbll[0] + zbll[1];
      if (coll==thisColl & this.selected[zbll])
        count++;
    }
    return count;
  }

  getTotalCount(coll) {
    let ocll = coll[0];
    if (this.cases[ocll])
      return this.cases[ocll][coll].length;
    else
      return 0;
  }

  isPartialSelected(coll) {
    let selectedLevel = this.getSelectedCount(coll);
    return (selectedLevel > 0 & selectedLevel < this.getTotalCount(coll));
  }

  isNotSelected(coll) {
    let selectedLevel = this.getSelectedCount(coll);
    return (selectedLevel == 0);
  }

  isFullySelected(coll) {
    let selectedLevel = this.getSelectedCount(coll);
    return (selectedLevel == this.getTotalCount(coll));
  }

  selectAll(coll) {
    let ocll = coll[0];

    let select = true;
    if (this.isFullySelected(coll)) {
      select = false;
    }
    if (this.cases[ocll]) {
      for (let iZbll = 0; iZbll < this.cases[ocll][coll].length; iZbll++) {
        let zbll = this.cases[ocll][coll][iZbll];
        this.selected[zbll] = select;
      }
    }
  }

  isFullySelectedOCLL(ocll) {
    if (this.cases[ocll]) {
      for (let coll in this.cases[ocll]) {
        if (!this.isFullySelected(coll)) {
          return false;
        }
      }
    }
    return true;
  }

  isPartiallySelectedOCLL(ocll) {
    let hasfull = false;
    let hasempty = false;
    if (this.cases[ocll]) {
      for (let coll in this.cases[ocll]) {
        if (this.isPartialSelected(coll)) {
          return true;
        }
        else if (this.isFullySelected(coll)) {
          hasfull = true;
          if (hasempty) {
            return true;
          }
        }
        else if (this.isNotSelected(coll)) {
          hasempty = true;
          if (hasfull) {
            return true;
          }
        }
      }
    }
    return false;
  }

  selectOCLL(ocll) {
    if (this.cases[ocll]) {
      let select = !this.isFullySelectedOCLL(ocll);
      for (let coll in this.cases[ocll]) {
        for (let iZbll = 0; iZbll < this.cases[ocll][coll].length; iZbll++) {
          let zbll = this.cases[ocll][coll][iZbll];
          this.selected[zbll] = select;
        }
      }
    }
  }

  getCaseName(coll) {
    let ocllNames = {
      '0':'PLL',
      'A':'Anti-Sune',
      'H':'H',
      'U':'U',
      'L':'L',
      'T':'T',
      'P':'Pi',
      'S':'Sune'
    }

    let collNames = {
      '0':'Corners solved',
      'D':'Diagonal swap',
      'F':'Adjacent swap front',
      'R':'Adjacent swap right',
      'B':'Adjacent swap back',
      'L':'Adjacent swap left'
    }

    return ocllNames[coll[0]] + ', ' + collNames[coll[1]]
  }
}

export const caseSelector = {
  template: require('./caseSelector.html'),
  controller: CaseSelectorController
};

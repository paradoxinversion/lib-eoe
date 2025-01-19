import { ShufflebagFrequency } from '../../types/managers/shufflebag';
export default class Shufflebag {
  frequencyMap: ShufflebagFrequency;
  values: string[];

  constructor(frequencyMap: ShufflebagFrequency) {
    this.frequencyMap = frequencyMap;
    this.values = this.getValueSet(frequencyMap);
  }

  getValueSet(frequencyMap: ShufflebagFrequency) {
    const valueSet: string[] = [];
    for (const entry in frequencyMap) {
      for (let y = 0; y < frequencyMap[entry]; y++) {
        valueSet.push(entry);
      }
    }
    return valueSet;
  }

  next() {
    const selectedValue = Math.floor(Math.random() * this.values.length);
    const selection = this.values[selectedValue];
    this.values.splice(selectedValue, 1);
    if (this.values.length === 0)
      this.values = this.getValueSet(this.frequencyMap);
    return selection;
  }
}

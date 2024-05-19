import Shufflebag from './shufflebag';

export default class ShufflebagManager {
  private static instance: ShufflebagManager;

  shuffleBags: {
    [key: string]: Shufflebag;
  };

  constructor() {
    this.shuffleBags = {};
  }

  public static getInstance(): ShufflebagManager {
    if (!ShufflebagManager.instance) {
      ShufflebagManager.instance = new ShufflebagManager();
    }

    return ShufflebagManager.instance;
  }

  addShufflebag(key: string, frequencyMap: { [key: string]: number }) {
    this.shuffleBags[key] = new Shufflebag(frequencyMap);
    console.log(this.shuffleBags);
    return this.shuffleBags[key];
  }
}

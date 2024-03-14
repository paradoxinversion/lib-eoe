import { GameManager } from './GameManager';
import { getControlledZones } from './organization';
import { getZones } from './zones';
/**
 * Takes an array of strings and throws an error with those
 * strings joined (space seperated) as its message.
 * @param {string[]} errorMessageArray
 */
const throwErrorFromArray = (errorMessageArray: string[] = []) => {
  if (errorMessageArray.length > 0) {
    throw new Error(errorMessageArray.join(' '));
  }
};

/**
 * Returns a random number from min to max (inclusive)
 * @param {number} min
 * @param {number} max
 */
const randomInt = (min = 0, max = 100) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

interface ShufflebagFrequency {
  [x: string]: number;
}

/**
 * Better random values that `randomInt`
 */
const Shufflebag = (
  /** a key/value map of options and their frequencies */
  frequencyMap: ShufflebagFrequency,
) => {
  /**
   * Set the Shufflebag's values
   */
  const getValueSet = (frequencyMap: ShufflebagFrequency) => {
    let valueSet: string[] = [];
    for (let entry in frequencyMap) {
      for (let y = 0; y < frequencyMap[entry]; y++) {
        valueSet.push(entry);
      }
    }
    return valueSet;
  };

  const fmap = frequencyMap;
  let values = getValueSet(fmap);
  return {
    /**
     * Return the next value in the shufflebag.
     */
    next() {
      const selectedValue = Math.floor(Math.random() * values.length);
      const selection = values[selectedValue];
      values.splice(selectedValue, 1);
      if (values.length === 0) values = getValueSet(fmap);
      return selection;
    },
  };
};

/**
 *
 */
const checkGameOverState = (gameManager: GameManager) => {
  const { gameData } = gameManager;
  if (
    gameData.people[gameData.player.overlordId]?.vitalAttributes
      .currentHealth <= 0
  ) {
    return {
      gameOverCause: 'overlord-death',
    };
  }

  return null;
};

/**
 *
 * @param {GameManager} gameManager
 */
const checkVictoryState = (gameManager: GameManager) => {
  const { gameData } = gameManager;
  const playerZones = getControlledZones(
    gameManager,
    gameData.player.organizationId,
  );
  if (playerZones.length === Object.keys(gameData.zones).length) {
    return {
      victoryCause: 'world-domination',
    };
  }

  return null;
};

/**
 * Returns a number with a possible margin of error.
 *
 * If confidence is 100, the response will be accurate.
 *
 * If < 100, the value will be
 * @param {number} trueValue - The actual value of the number
 * @param {number} confidence - The confidence in this value. 100 - confidence = margin of error.
 */
const numberWithErrorMargin = (trueValue: number, confidence: number) => {
  if (confidence === 100) {
    return trueValue;
  }

  const marginOfErrorPercentage = 100 - confidence;
  const marginOfErrorAmt = (marginOfErrorPercentage / 100) * trueValue;

  return trueValue - marginOfErrorAmt / 2;
};

export {
  throwErrorFromArray,
  randomInt,
  Shufflebag,
  checkGameOverState,
  checkVictoryState,
  numberWithErrorMargin,
};

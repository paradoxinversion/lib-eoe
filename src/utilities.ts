import GameManager from './managers/game/GameManager';
import zones from './actions/zones';
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

/**
 *
 */
const checkGameOverState = () => {
  const { gameData } = GameManager.getInstance();
  if (
    gameData.people[gameData.player.overlordId]?.derivedAttributes.health
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
const checkVictoryState = () => {
  const { gameData } = GameManager.getInstance();
  const playerZones = zones.getZones({
    organizationId: gameData.player.organizationId,
  });
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

const skillCheck = () => {
  // to implement
};

const skillLevelStr = (amount: number) => {
  const skillPercentage = (amount / 100) * 100;
  return (
    skillPercentage === 100 ? 'Master'
    : skillPercentage > 80 ? 'Expert'
    : skillPercentage > 60 ? 'Professional'
    : skillPercentage > 40 ? 'Skilled'
    : skillPercentage > 20 ? 'Novice'
    : 'Amateur'
  );
};

const attributeLevelStr = (amount: number) => {
  const attributePercentage = (amount / 10) * 100;
  return (
    attributePercentage === 10 ? 'Peak'
    : attributePercentage > 8 ? 'Above Average'
    : attributePercentage > 6 ? 'Average'
    : attributePercentage > 4 ? 'Below Average'
    : 'Terrible'
  );
};
export default {
  throwErrorFromArray,
  randomInt,
  checkGameOverState,
  checkVictoryState,
  numberWithErrorMargin,
  skillLevelStr,
  attributeLevelStr,
};

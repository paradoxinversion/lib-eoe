/**
 * Takes an array of strings and throws an error with those
 * strings joined (space seperated) as its message.
 * @param {string[]} errorMessageArray
 */
const throwErrorFromArray = (errorMessageArray=[]) => {
    if (errorMessageArray.length > 0){
        throw new Error(errorMessageArray.join(" "))
    }
}

/**
 * Returns a random number from min to max (inclusive)
 * @param {number} min 
 * @param {number} max 
 */
const randomInt = (min=0, max=100) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Better random values that `randomInt`
 * @param {import("./typedef").ShufflebagFrequency} frequencyMap - a key/value map of options and their frequencies
 */
const Shufflebag = frequencyMap => {
    /**
     * Set the Shufflebag's values
     * @param {import("./typedef").ShufflebagFrequency} frequencyMap 
     */
    const getValueSet = frequencyMap => {
      let valueSet = [];
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
      }
    };
  };

module.exports = {
    throwErrorFromArray,
    randomInt,
    Shufflebag
}
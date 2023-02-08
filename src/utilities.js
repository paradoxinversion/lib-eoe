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

module.exports = {
    throwErrorFromArray,
    randomInt
}
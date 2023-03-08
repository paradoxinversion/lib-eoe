const { randomInt } = require("../utilities");

/**
 * Generate a random character name
 * @returns {string}
 */
const generateName = () => {
 const firstNames = [
  "Adam",
  "Anna",
  "Bill",
  "Beth",
  "Dan",
  "Denise",
  "Edgar",
  "Emma",
  "John",
  "Jill",
  "Kyle",
  "Karen"
 ];

 const lastNames = [
  "Aronson",
  "Bonner",
  "Craig",
  "Darcy",
  "Black",
  "White",
  "Meyer",
  "Gonzales",
  "Chan"
 ]

 const name = `${firstNames[randomInt(0,firstNames.length-1)]} ${lastNames[randomInt(0,lastNames.length-1)]}`;
 return name;
}

module.exports = {
  generateName
}
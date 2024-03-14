import { randomInt } from '../utilities';
const nationNames = [
  'Arcadia',
  'Dystopia',
  'Evergreenland',
  'Farland',
  'Highland',
  'Midland',
  'Nearland',
  'Lowland',
  'Myrtle',
  'Serenia',
  'Shadyland',
];
const compoundZoneNameBases = [
  'Black',
  'Diamond',
  'Dystopia',
  'Granite',
  'Joy',
  'Red',
  'Running',
  'Sapphire',
  'Silent',
  'Snowy',
  'White',
  'Sweet',
  'Morose',
  'Blue',
  'Orange',
];

const compoundZoneNameEndings = [
  'Falls',
  'Hollow',
  'Village',
  'Township',
  'City',
  'Town',
];

const generateZoneName = () => {
  return `${
    compoundZoneNameBases[randomInt(0, compoundZoneNameBases.length - 1)]
  } ${
    compoundZoneNameEndings[randomInt(0, compoundZoneNameEndings.length - 1)]
  }`;
};
/**
 * Generate a random character name
 * @returns {string}
 */
const generateName = () => {
  const firstNames = [
    'Adam',
    'Aiden',
    'Alberta',
    'Alec',
    'Alex',
    'Anna',
    'Bill',
    'Belle',
    'Benjamin',
    'Beth',
    'Dan',
    'Danielle',
    'Denise',
    'Ed',
    'Eddy',
    'Edgar',
    'Emma',
    'Fred',
    'Frederick',
    'Jane',
    'Jayden',
    'Jessica',
    'Jill',
    'Jim',
    'John',
    'Karen',
    'Kyle',
    'Lara',
    'Laura',
    'Lauren',
    'Laurence',
    'Richard',
    'Rick',
    'Stewart',
    'Stu',
    'Sue',
    'Susan',
    'Susanne',
    'Warren',
    'Wilbur',
    'Zelda',
  ];

  const lastNames = [
    'Aronson',
    'Black',
    'Brown',
    'Butler',
    'Bonner',
    'Brook',
    'Brown',
    'Chan',
    'Craig',
    'Darcy',
    'Delgado',
    'Ford',
    'Franklin',
    'Gonzales',
    'Macy',
    'Meyer',
    'Meyers',
    'Micheals',
    'Miller',
    'Miyamoto',
    'Miyazaki',
    'Moss',
    'Mosely',
    'Schinn',
    'Silverstone',
    'Smith',
    'Weatherly',
    'White',
  ];

  const name = `${firstNames[randomInt(0, firstNames.length - 1)]} ${
    lastNames[randomInt(0, lastNames.length - 1)]
  }`;
  return name;
};

export { generateName, generateZoneName, nationNames };

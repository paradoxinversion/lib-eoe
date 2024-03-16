import { randomInt } from '../utilities';
import femmeNames from './names/femme.json';
import mascNames from './names/masc.json';
import surnames from './names/surname.json';
import compoundZoneNameBases from './names/zone-compound-name-base.json';
import compoundZoneNameEndings from './names/compound-zone-name-end.json';
import companyBaseNames from './names/company.json';
import companyDescriptors from './names/company-descriptor.json';
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

export const generateCompanyName = () => {
  return `${companyBaseNames[randomInt(0, companyBaseNames.length - 1)]} ${
    companyDescriptors[randomInt(0, companyDescriptors.length - 1)]
  }`;
};

const generateZoneName = () => {
  return `${
    compoundZoneNameBases[randomInt(0, compoundZoneNameBases.length - 1)]
  } ${
    compoundZoneNameEndings[randomInt(0, compoundZoneNameEndings.length - 1)]
  }`;
};

/**
 * Generate a random character name
 */
const generateName = () => {
  const firstNames = femmeNames.concat(mascNames);
  const lastNames = surnames;

  const name = `${firstNames[randomInt(0, firstNames.length - 1)]} ${
    lastNames[randomInt(0, lastNames.length - 1)]
  }`;
  return name;
};

export { generateName, generateZoneName, nationNames };

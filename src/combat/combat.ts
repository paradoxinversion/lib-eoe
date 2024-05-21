import people from '../actions/people';
import { Person } from '../types/interfaces/entities';

interface CombatInitiative {
  /** The initiative order */
  initiative: number;
  /** Is this person in the attacking force? */
  attackingForce: boolean;
  /** The index of the character within their source array */
  characterIndex: number;
  person: Person;
}

/**
 * Creates a CombatInitiative object.
 */
const createInitiative = (
  /** The initiativevalue */
  initiative: number,
  /** Whether or not the associated character is in the attacking side of this combat encounter */
  attackingForce: boolean,
  /** The index of the associated character within their source array. */
  characterIndex: number,
  person: Person,
): CombatInitiative => {
  return {
    initiative,
    attackingForce,
    characterIndex,
    person,
  };
};

/**
 * From two opposing sides, creates an array of InitiativeObjects and sorts
 * them by their initiative value.
 * @param  aggressingForce - An array of people on the attacking side of the combat encounter
 * @param  - An array of people on the attacking side of the combat encounter
 */
const generateInitiative = (
  aggressingForce: Person[],
  defendingForce: Person[],
) => {
  const attackerInitiative = aggressingForce.reduce(
    (initiativeArray: CombatInitiative[], person, index) => {
      if (person.derivedAttributes.health.currentHealth > 0) {
        initiativeArray.push(
          createInitiative(
            Math.floor(Math.random() * 10 + person.skills.combat),
            true,
            index,
            person,
          ),
        );
      }
      return initiativeArray;
    },
    [],
  );
  const defenderInitiative = defendingForce
    .reduce((initiativeArray: CombatInitiative[], person, index) => {
      if (person.derivedAttributes.health.currentHealth > 0) {
        initiativeArray.push(
          createInitiative(
            Math.floor(Math.random() * 10 + person.skills.combat),
            false,
            index,
            person,
          ),
        );
      }
      return initiativeArray;
    }, [])
    .sort();
  return attackerInitiative
    .concat(defenderInitiative)
    .sort((a, b) => a.initiative - b.initiative);
};

/**
 * Returns indexes of people from an array of people that can be targeted for combat.
 * Currently, this means that they have more health than zero (ie,
 * not dead), so take care that `targetForce` only includes intended
 * entities.
 */
const getPossibleTargets = (
  /** An array of people who are allowable targets. Allies should be excluded. */
  targetForce: Person[],
) => {
  return targetForce.reduce((prev: number[], person, index) => {
    if (person.derivedAttributes.health.currentHealth > 0) {
      prev.push(index);
    }
    return prev;
  }, []);
};

export interface CombatResult {
  /** The number of rounds the combat encounter lasted */
  rounds: number;
  /** An array of strings representing the combat log */
  combatLog: string[];
  /** The result of the combat encounter */
  victoryResult: 0 | 1 | 2;
  characters: {
    attackers: Person[];
    defenders: Person[];
  };
}

/**
 * Executes a combat encounter between two opposing forces. Individual characters
 * from each force will attack turn-by-turn depending on an initative order.
 */
const doCombat = (
  /** The attacking force in the encounter */
  aggressingForce: Person[],
  /** The defending force in the encounter */
  defendingForce: Person[],
): CombatResult => {
  // Seed the combat log
  const combatLog = ['Combat Begins'];

  // The initiative array sorts characters into init order
  const initiativeArray = generateInitiative(aggressingForce, defendingForce);

  // Keeping track of the rounds allows us to cut off the battle if for some reason
  // it's stuck in a stalemate (or bug)
  let rounds = 0;

  // Loop the main battle logic until one side is entirely dead.
  while (
    defendingForce.some(
      (defender) => defender.derivedAttributes.health.currentHealth > 0,
    ) &&
    aggressingForce.some(
      (attacker) => attacker.derivedAttributes.health.currentHealth > 0,
    )
  ) {
    // Start going down the list of combat initiatives
    initiativeArray.forEach((combatInitiative) => {
      const isAggressingForce = combatInitiative.attackingForce;
      const attacker =
        isAggressingForce ?
          aggressingForce[combatInitiative.characterIndex]
        : defendingForce[combatInitiative.characterIndex];

      // If the attacker is alive, get a list of living/targetable enemies
      if (attacker.derivedAttributes.health.currentHealth >= 0) {
        const possibleTargets = getPossibleTargets(
          isAggressingForce ? defendingForce : aggressingForce,
        );

        if (possibleTargets.length > 0) {
          // If we have valid targets, choose one
          // It is the index of the character to be attacked
          const targetIndex =
            possibleTargets[Math.floor(Math.random() * possibleTargets.length)];

          // Determine who the defender is
          const defender =
            isAggressingForce ?
              defendingForce[targetIndex]
            : aggressingForce[targetIndex];

          // Determine the damage of the attack
          let damage =
            Math.floor(Math.random() * 6 + 1) +
            attacker.skills.combat -
            defender.skills.combat;
          if (damage <= 0) {
            damage = 1;
          }

          if (isAggressingForce) {
            if (defendingForce[targetIndex]) {
              defendingForce[targetIndex] = people.updateCurrentHealth(
                defendingForce[targetIndex],
                -damage,
              ).people[defendingForce[targetIndex].id];
            }
          } else {
            if (aggressingForce[targetIndex]) {
              aggressingForce[targetIndex] = people.updateCurrentHealth(
                aggressingForce[targetIndex],
                -damage,
              ).people[aggressingForce[targetIndex].id];
            }
          }
          combatLog.push(
            `${attacker.name} deals ${damage} damage to ${defender.name} (${defender.derivedAttributes.health.currentHealth})`,
          );

          if (
            isAggressingForce ?
              defendingForce[targetIndex].derivedAttributes.health.currentHealth
            : aggressingForce[targetIndex].derivedAttributes.health
                .currentHealth <= 0
          ) {
            console.log(defender.name, 'has been killed');
            if (isAggressingForce) {
              // If our attacker is in the aggressing force
              defendingForce[targetIndex] = people.killPerson(
                defendingForce[targetIndex],
              ).people[defendingForce[targetIndex].id];
            } else {
              // If our attacker is in the defending force
              aggressingForce[targetIndex] = people.killPerson(
                aggressingForce[targetIndex],
              ).people[aggressingForce[targetIndex].id];
            }
          }
        }
      }
    });
    rounds++;
  }
  const livingAttackers = aggressingForce.reduce((total, currentAgent) => {
    if (currentAgent.derivedAttributes.health.currentHealth > 0) {
      return total + 1;
    }
    return total;
  }, 0);
  const livingDefenders = defendingForce.reduce((total, currentAgent) => {
    if (currentAgent.derivedAttributes.health.currentHealth > 0) {
      return total + 1;
    }
    return total;
  }, 0);

  const victoryResult =
    livingAttackers === 0 && livingDefenders > 0 ? 0
    : livingAttackers > 0 && livingDefenders === 0 ? 1
    : 2;
  return {
    combatLog,
    rounds,
    victoryResult,
    characters: {
      attackers: aggressingForce,
      defenders: defendingForce,
    },
  };
};

export default {
  createInitiative,
  generateInitiative,
  getPossibleTargets,
  doCombat,
};

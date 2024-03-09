import { Person } from "./types/interfaces/entities";

interface CombatInitiative{
  initiative: number;
  attackingForce: boolean;
  characterIndex: number;
}

/**
 * Creates a CombatInitiative object.
 * @param {number} initiative - The initiative value
 * @param {boolean} attackingForce - Whether or not the associated character is in the attacking side of this combat encounter
 * @param {number} characterIndex - The index of the associate character within their source array.
 * @returns {import("./typedef").CombatInitiative} A CombatInitiative Object
 */
const createInitiative = (initiative: number, attackingForce: boolean, characterIndex:number): CombatInitiative => {
  return {
    initiative,
    attackingForce,
    characterIndex,
  };
};

/**
 * From two opposing sides, creates an array of InitiativeObjects and sorts
 * them by their initiative value.
 * @param {import("./typedef").Person[]} aggressingForce - An array of people on the attacking side of the combat encounter
 * @param {import("./typedef").Person[]} defendingForce - An array of people on the attacking side of the combat encounter
 * @returns {import("./typedef").CombatInitiative[]} An array of CombatInitiative objects, sorted by their `initiative`
 */
const generateInitiative = (aggressingForce: Person[], defendingForce: Person[]) => {
  const attackerInit = aggressingForce.reduce((prev: CombatInitiative[], person, index) => {
    if (person.currentHealth > 0) {
      prev.push(
        createInitiative(
          Math.floor(Math.random() * 10 + person.combat),
          true,
          index
        )
      );
    }
    return prev;
  }, []);
  const defenderInit = defendingForce
    .reduce((prev: CombatInitiative[], person, index) => {
      if (person.currentHealth > 0) {
        prev.push(
          createInitiative(
            Math.floor(Math.random() * 10 + person.combat),
            false,
            index
          )
        );
      }
      return prev;
    }, [])
    .sort();
  return attackerInit
    .concat(defenderInit)
    .sort((a, b) => a.initiative - b.initiative);
};

/**
 * Returns indexes of people from an array of people that can be targeted for combat.
 * Currently, this means that they have more health than zero (ie,
 * not dead), so take care that `targetForce` only includes intended
 * entities.
 * @param {import("./typedef").Person[]} targetForce - An array of people who are allowable targets. Allies should be excluded.
 * @returns {number[]}
 */
const getPossibleTargets = (targetForce: Person[]) => {
  return targetForce.reduce((prev: number[], person, index) => {
    if (person.currentHealth > 0) {
      prev.push(index);
    }
    return prev;
  }, []);
};

interface CombatResult{
  rounds: number;
  combatLog: string[];
  victoryResult: 0|1|2;
  characters: {
    attackers: Person[];
    defenders: Person[]
  }
}

/**
 * Executes a combat encounter between two opposing forces. Individual characters
 * from each force will attack turn-by-turn depending on an initative order.
 *
 * @param {import("./typedef").Person[]} aggressingForce - The attacking force in the enouncter
 * @param {import("./typedef").Person[]} defendingForce - The defending force in the encounter.
 * @returns {import("./typedef").CombatResult} The result of the combat encounter
 */
const doCombat = (aggressingForce: Person[], defendingForce: Person[]): CombatResult => {
  // Seed the combat log
  const combatLog = ["Combat Begins"];

  // The initiative array sorts characters into init order
  const initiativeArray = generateInitiative(aggressingForce, defendingForce);

  // Keeping track of the rounds allows us to cut off the battle if for some reason
  // it's stuck in a stalemate (or bug)
  let rounds = 0;

  // Loop the main battle logic until one side is entirely dead.
  while (
    defendingForce.some((defender) => defender.currentHealth > 0) &&
    aggressingForce.some((attacker) => attacker.currentHealth > 0)
  ) {
    // Start going down the list of combat initiatives
    initiativeArray.forEach((combatInitiative) => {
      const isAggressingForce = combatInitiative.attackingForce;
      // Determine who this attacker is
      const attacker = isAggressingForce
        ? aggressingForce[combatInitiative.characterIndex]
        : defendingForce[combatInitiative.characterIndex];

      if (attacker.currentHealth >= 0) {
        // If the attacker is alive, get a list of living/targetable enemies
        const possibleTargets = getPossibleTargets(
          isAggressingForce ? defendingForce : aggressingForce
        );

        if (possibleTargets.length > 0) {
          // If we have valid targets, choose one
          // It is the index of the character to be attacked
          const targetIndex =
            possibleTargets[Math.floor(Math.random() * possibleTargets.length)];

          // Determine who the defender is
          const defender = isAggressingForce
            ? defendingForce[targetIndex]
            : aggressingForce[targetIndex];

          // Determine the damage of the attack
          let damage =
            Math.floor(Math.random() * 6 + 1) +
            attacker.combat -
            defender.combat;
          if (damage <= 0) {
            damage = 1;
          }
          
          // Reduce the defender's health
          // defender.currentHealth = defender.currentHealth - damage;
          if (isAggressingForce){
            defendingForce[targetIndex] = {...defender, currentHealth: defender.currentHealth - damage};

          }else {
            aggressingForce[targetIndex] = {...defender, currentHealth: defender.currentHealth - damage};
          }
          combatLog.push(
            `${attacker.name} deals ${damage} damage to ${defender.name} (${defender.currentHealth})`
          );
          if (defender.currentHealth <= 0) {
            console.log(defender.name, "has been killed");
          }
        }
      }
    });
    rounds++;
  }
  const livingAttackers = aggressingForce.reduce((total, currentAgent) => {
    if (currentAgent.currentHealth > 0) {
      return total + 1;
    }
    return total;
  }, 0);
  console.log(aggressingForce);
  const livingDefenders = defendingForce.reduce((total, currentAgent) => {
    if (currentAgent.currentHealth > 0) {
      return total + 1;
    }
    return total;
  }, 0);
  console.log("LA:", livingAttackers, "LD:", livingDefenders);
  const victoryResult =
    livingAttackers === 0 && livingDefenders > 0
      ? 0
      : livingAttackers > 0 && livingDefenders === 0
      ? 1
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

export {
  createInitiative,
  generateInitiative,
  getPossibleTargets,
  doCombat,
};

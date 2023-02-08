/**
 * Creates a CombatInitiative object.
 * @param {number} initiative - The initiative value
 * @param {boolean} attackingForce - Whether or not the associated character is in the attacking side of this combat encounter 
 * @param {number} characterIndex - The index of the associate character within their source array.
 * @returns {import("./typedef").CombatInitiative} A CombatInitiative Object
 */
const createInitiative = (initiative, attackingForce, characterIndex) => {
    return {
        initiative,
        attackingForce,
        characterIndex
    }
}

/**
 * From two opposing sides, creates an array of InitiativeObjects and sorts
 * them by their initiative value.
 * @param {import("./typedef").Person[]} aggressingForce - An array of people on the attacking side of the combat encounter
 * @param {import("./typedef").Person[]} defendingForce - An array of people on the attacking side of the combat encounter
 * @returns {import("./typedef").CombatInitiative[]} An array of CombatInitiative objects, sorted by their `initiative`
 */
const generateInitiative = (aggressingForce, defendingForce) => {
    const attackerInit = aggressingForce
        .reduce(
            (prev, person, index) => {
                if (person.currentHealth > 0){
                    prev.push(createInitiative(Math.floor(Math.random() * 10 + person.combat), true, index))
                }
                return prev;
                }, 
            [])
    const defenderInit = defendingForce
        .reduce(
            (prev, person, index) => {
                if (person.currentHealth > 0){
                    prev.push(createInitiative(Math.floor(Math.random() * 10 + person.combat), false, index))
                }
                return prev;
                }, 
            [])
        .sort();
    return attackerInit.concat(defenderInit).sort((a, b) => a.initiative - b.initiative);
}

/**
 * Returns indexes of people from an array of people that can be targeted for combat.
 * Currently, this means that they have more health than zero (ie,
 * not dead), so take care that `targetForce` only includes intended
 * entities.
 * @param {import("./typedef").Person[]} targetForce - An array of people who are allowable targets. Allies should be excluded.
 * @returns {number[]}
 */
const getPossibleTargets = (targetForce) => {
    return targetForce.reduce((prev, person, index)=>{
        if (person.currentHealth > 0){
            prev.push(index)
        }
        return prev;
    },[])
}

/**
 * Executes a combat encounter between two opposing forces. Individual characters
 * from each force will attack turn-by-turn depending on an initative order.
 * 
 * @param {import("./typedef").Person[]} aggressingForce - The attacking force in the enouncter
 * @param {import("./typedef").Person[]} defendingForce - The defending force in the encounter.
 * @returns {import("./typedef").CombatResult} The result of the combat encounter
 */
const doCombat = (aggressingForce, defendingForce) => {
    const combatLog = ["Combat Begins"];
    const initiativeArray = generateInitiative(aggressingForce, defendingForce);
    let rounds = 0
    while(
        defendingForce.some(defender => defender.currentHealth > 0) &&
        aggressingForce.some(attacker => attacker.currentHealth > 0) 
    ){
        initiativeArray.forEach(combatInitiative => {
            const possibleTargets = getPossibleTargets(combatInitiative.attackingForce ? defendingForce : aggressingForce);
            if (possibleTargets.length > 0){
                const targetIndex = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
                const attacker = combatInitiative.attackingForce 
                    ? aggressingForce[combatInitiative.characterIndex]
                    : defendingForce[combatInitiative.characterIndex];

                const defender = combatInitiative.attackingForce 
                    ? defendingForce[targetIndex]
                    : aggressingForce[targetIndex];
                    
                let damage = Math.floor(Math.random() * 6 + 1) + attacker.combat - defender.combat;
                if (damage <= 0){
                    damage = 1;
                }
    
                defender.currentHealth = defender.currentHealth - damage;
                combatLog.push(`${attacker.name} deals ${damage} damage to ${defender.name}`);
            } 
        });
        rounds++;
    }
    return {
        combatLog,
        rounds,
        characters: {
            attackers: aggressingForce,
            defenders: defendingForce
        }
    }
}

module.exports = {
    createInitiative,
    generateInitiative,
    getPossibleTargets,
    doCombat
}
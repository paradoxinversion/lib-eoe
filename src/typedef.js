/**
 * A Nation
 * @typedef {Object} Nation
 * @property {string} id - The nation's indentifier, prefixed with `n_`
 * @property {string} name - The name of the nation
 * @property {number} size - The size (amount of zones) of the nation
 */

/**
 * A Zone
 * @typedef {Object} Zone
 * @property {string} id - The zone's indentifier, prefixed with `z_`
 * @property {string} name - The name of the zone
 * @property {string} nationId - The ID of the nation the zone belongs to
 * @property {number} size - The size (amount of citizens) in the zone
 * @property {number} wealth - the wealth value of the zone
 */

/**
 * A Person
 * @typedef {Object} Person
 * @property {string} id - The person's indentifier, prefixed with `p_`
 * @property {string} nationId - The ID of the nation the Person belongs to
 * @property {string} zoneId - The ID of the Zone this Person calls home
 * @property {string} name - The name of the person.
 * @property {number} administration - how smart the person is, related to Administration
 * @property {number} combat - How capable of combat the character is, related to Evil Troops
 * @property {number} intelligence - how smart the person is, related to Science
 * @property {number} loyalty - how likely the person is to remain loyal to their nation/org
 * @property {number} health - the person's max health
 * @property {number} currentHealth - the person's current health
 * @property {AgentData} agent - If present, data about the peron's agent status
 * @property {number} leadership - the max possible agents the agent can manag
 */

/**
 * A Governing Organization
 * @typedef {Object} GoverningOrganization
 * @property {string} id - The governing body's indentifier, prefixed with `g_`
 * @property {string} nationId - The ID of the nation this org governs
 * @property {boolean} evil - Whether or not the org is EVIL.
 * @property {string} name - The name of the org.
 */

/**
 * A Governing Organization
 * @typedef {Object} CombatInitiative
 * @property {number} initiative - The number order in which the character should attack
 * @property {boolean} attackingForce - 
 * @property {number} characterIndex
 */

/**
 * Data about the agent status of a charactr
 * @typedef {Object} AgentData
 * @property {number} department - 0 (troop), 1 (administrator), or 2 (scientist)
 * @property {string} organizationId - the id of the org this Agent works for
 */

/**
 * Data about the agent status of a charactr
 * @typedef {Object} CombatResult
 * @property {number} rounds - The total amount of rounds
 * @property {string[]} combatLog - An array of combat log messages
 * @property {object} characters
 * @property {Person[]} characters.attackers 
 * @property {Person[]} characters.defendrs 
 */

module.exports = {}
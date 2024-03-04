const { getCitizens } = require("./citizens");
const { getAgents } = require("./organization");
import { Plot } from "./plots.ts";
const { getZoneCitizens } = require("./zones");

/**
 *
 * @param {import("./typedef").GameData} gameData
 */
const requirementEoECitizenAvailable = (gameData) => {
  return getCitizens(gameData.people, gameData.player.empireId, true).length > 0
    ? true
    : false;
};

const requirementEoECitizenInZoneAvailable = (gameData, requirementParams) => {
  const zoneId = requirementParams.zoneId;
  return getZoneCitizens(gameData.people, zoneId, true).length > 0
    ? true
    : false;
};

/**
 *
 * @param {import("./typedef").GameData} gameData
 * @param {Plot} plot
 */
const requirementEoEMinAgents = (gameData, minAgents, plot) => {
  if (plot && plot.agents.length < minAgents) {
    return false;
  }

  if (getAgents(gameData, gameData.player.organizationId, true) < minAgents) {
    return false;
  }
  return true;
};

const requirementEoEMaxAgents = (gameData, maxAgents, plot) => {
  if (plot && plot.agents.length > maxAgents) {
    return false;
  }

  if (getAgents(gameData, gameData.player.organizationId, true) > maxAgents) {
    return false;
  }
  return true;
};

module.exports = {
  requirementEoECitizenInZoneAvailable,
};

const { RecruitEvent, StandardReportEvent } = require("../gameEvents");
/**
 * Create a recruitment event
 * @param {import("../typedef").Person} recruit
 * @param {string} organizationId
 * @param {number} department
 */
const setEvilApplicantParams = (recruit, organizationId, department) => {
    return {
        organizationId,
        department,
        recruit
    }
}

/**
 * 
 * @param {import("../typedef").Person[]} aggressingForce 
 * @param {import("../typedef").Person[]} defendingForce 
 */
const setCombatParams = (aggressingForce, defendingForce) => {
    return {
        aggressingForce, defendingForce
    }
}


/**
 * @type {import("../typedef").EventConfig}
 */
const eventConfig = {
    recruit: {
        name: "Evil Applicant",
        setParams: setEvilApplicantParams,
        requirements: {}
    },
    standardReport: {
        name: "Standard Report",
        setParams: () => null,
        requirements: {}
    },
    combat: {
        name: "Combat",
        setParams: setCombatParams,
        requirements: {}
    },
    wealthMod: {
        name: "Wealth Change",
        setParams: () => null,
        requirements: {}
    },
    attackZone: {
        name: "Attack Zone",
        setParams: () => null,
        requirements: {}
    }
}
/**
 * 
 * @param {import("../typedef").Person[]} peopleArray - 
 * @param {string} nationId 
 */
const generateRecruitEvent = (peopleArray, nationId, organizationId) => {
    const recruit = peopleArray.find((person) => {
        if (person.nationId === nationId && person.agent === null){
            return true;
        }
    });
    const recruitEvent = new RecruitEvent(recruit, organizationId);
    return recruitEvent;
}

const generateStandardReportEvent = () => {
    const standardReportEvent = new StandardReportEvent()
    return standardReportEvent;
}

module.exports = {
    generateRecruitEvent,
    generateStandardReportEvent, 
    eventConfig
}
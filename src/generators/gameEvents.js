const { RecruitEvent, StandardReportEvent } = require("../gameEvents");

/**
 *
 * @param {import("../typedef").Person[]} peopleArray -
 * @param {string} nationId
 */
const generateRecruitEvent = (peopleArray, nationId, organizationId) => {
  const recruit = peopleArray.find((person) => {
    if (person.nationId === nationId && person.agent === null) {
      return true;
    }
  });
  const recruitEvent = new RecruitEvent(recruit, organizationId);
  return recruitEvent;
};

const generateStandardReportEvent = () => {
  const standardReportEvent = new StandardReportEvent();
  return standardReportEvent;
};

module.exports = {
  generateRecruitEvent,
  generateStandardReportEvent,
};

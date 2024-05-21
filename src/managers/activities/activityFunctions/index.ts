import authorPropaganda from './authorPropaganda';
import { education } from './education';
import harassNuns from './harassNuns';
import { peacePatrol } from './peacePatrol';
import recruitAgents from './recruitAgents';
import siphonDomesticAccounts from './siphonDomesticAccounts';
import siphonGlobalAccounts from './siphonGlobalAccounts';
import { surveyCitizens } from './surveyCitizens';
import { executeTrainingActivity } from './training';

const activityFunctions = {
  authorPropaganda,
  evilEducation: education,
  harassNuns,
  peacePatrol,
  recruitAgents,
  siphonDomesticAccounts,
  siphonGlobalAccounts,
  surveyCitizens,
  training: executeTrainingActivity,
};

export default activityFunctions;

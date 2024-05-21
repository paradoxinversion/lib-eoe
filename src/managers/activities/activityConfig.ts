import { ScienceProject } from '../science/types';
import { GoverningOrgStatusEffects } from '../../statusEffects/governingOrg';
import authorPropaganda from './activityFunctions/authorPropaganda';
import { education } from './activityFunctions/education';
import harassNuns from './activityFunctions/harassNuns';
import { peacePatrol } from './activityFunctions/peacePatrol';
import recruitAgents from './activityFunctions/recruitAgents';
import siphonDomesticAccounts from './activityFunctions/siphonDomesticAccounts';
import siphonGlobalAccounts from './activityFunctions/siphonGlobalAccounts';
import { surveyCitizens } from './activityFunctions/surveyCitizens';
import { executeTrainingActivity } from './activityFunctions/training';

export interface ActivityRequirements {
  /** Research required to start the activity */
  research: ScienceProject[];
  orgStatusEffects: GoverningOrgStatusEffects[];
  maxParticipants: number;
  minParticipants: number;
}

export interface ActivityConfig {
  /** The name of the activity (to be shown to the user) */
  name: string;
  /** The activity's type */
  type: string;
  /** The function to handle the execution of the activity */
  fn: Function;
  /** Cost per particpant */
  costPerParticipant: number;
  description?: string;
  requirements?: ActivityRequirements;
}

const defaultRequirements: ActivityRequirements = {
  maxParticipants: -1,
  minParticipants: 1,
  research: [],
  orgStatusEffects: [],
};

const activityConfig: ActivityConfig[] = [
  {
    name: 'Recruit Agents',
    type: 'recruit-agents',
    fn: recruitAgents,
    costPerParticipant: 5,
    description: 'Seek out recruits for the EVIL Empire',
    requirements: {
      ...defaultRequirements,
    },
  },
  {
    name: 'Harass Nuns',
    type: 'harass-nuns',
    fn: harassNuns,
    costPerParticipant: 0,
    description: "Harass some nuns. Why? It's EVIL!",
    requirements: {
      ...defaultRequirements,
    },
  },
  {
    name: 'Training',
    type: 'training',
    fn: executeTrainingActivity,
    costPerParticipant: 15,
    description: 'Train your agents to improve their skills',
    requirements: {
      ...defaultRequirements,
    },
  },
  {
    name: 'EVIL Education',
    type: 'evil-educaton',
    fn: education,
    costPerParticipant: 10,
    description: "Ensure loyalty from your agents via 'continuing education'",
    requirements: {
      ...defaultRequirements,
    },
  },
  {
    name: 'Peace Patrol',
    type: 'peace-patrol',
    fn: peacePatrol,
    costPerParticipant: 5,
    requirements: {
      ...defaultRequirements,
    },
  },
  {
    name: 'Survey Citizens',
    type: 'survey-citizens',
    fn: surveyCitizens,
    costPerParticipant: 5,
    requirements: {
      ...defaultRequirements,
    },
  },
  {
    name: 'Siphon Domestic Accounts',
    type: 'siphon-domestic-accounts',
    costPerParticipant: 10,
    fn: siphonDomesticAccounts,
    requirements: {
      ...defaultRequirements,
      orgStatusEffects: ['encryption-protocols'],
    },
  },
  {
    name: 'Siphon Global Accounts',
    type: 'siphon-global-accounts',
    costPerParticipant: 10,
    fn: siphonGlobalAccounts,
    requirements: {
      ...defaultRequirements,
      orgStatusEffects: ['encryption-protocols'],
    },
  },
  {
    name: 'Author Propaganda',
    type: 'author-propaganda',
    costPerParticipant: 10,
    fn: authorPropaganda,
    requirements: {
      ...defaultRequirements,
    },
  },
  {
    name: 'Tap Citizen Communications',
    type: 'tap-citizen-communications',
    costPerParticipant: 8,
    fn: () => {},
    requirements: {
      ...defaultRequirements,
      orgStatusEffects: ['centralized-telecommunications'],
    },
  },
  {
    name: 'Tend to EVIL Pet',
    type: 'pet-tending',
    fn: executeTrainingActivity,
    costPerParticipant: 3,
    description: "Have your EVIL pet's needs attended to",
    requirements: {
      ...defaultRequirements,
      orgStatusEffects: ['pet'],
      maxParticipants: 1,
    },
  },
];

export default activityConfig;

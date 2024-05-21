import { attackZone } from './plotFunctions/attackZone';
import { executeReconPlot } from './plotFunctions/recon';
import { executeEmbedAgentsPlot } from './plotFunctions/embedAgents';
import { executeRecallEmbeddedAgentsPlot } from './plotFunctions/recallEmbeddedAgents';
import { executeInciteProtestPlot } from './plotFunctions/inciteProtest';
export type PlotRequirements = {
  personnel?: {
    embeddedAgents?: boolean;
  };
};
export const plotRequirementDefaults = {
  personnel: {
    embeddedAgents: false,
  },
};
export interface PlotConfig {
  /** The name of the activity (to be shown to the user) */
  name: string;
  /** The activity's type */
  type: string;
  /** The function to handle the execution of the activity */
  fn: Function;
  /** Cost per particpant */
  costPerParticipant: number;
  description?: string;
  requirements?: PlotRequirements;
}
const plotConfig: { [x: string]: PlotConfig } = {
  'attack-zone': {
    name: 'Attack Zone',
    type: 'attack-zone',
    fn: attackZone,
    costPerParticipant: 0,
  },
  'recon-zone': {
    name: 'Recon',
    type: 'recon-zone',
    fn: executeReconPlot,
    costPerParticipant: 0,
  },
  'embed-agents': {
    name: 'Embed Agents',
    type: 'embed-agents',
    fn: executeEmbedAgentsPlot,
    costPerParticipant: 0,
  },
  'recall-embedded-agents': {
    name: 'Recall Embedded Agents',
    type: 'recall-embedded-agents',
    fn: executeRecallEmbeddedAgentsPlot,
    costPerParticipant: 0,
    requirements: {
      personnel: {
        embeddedAgents: true,
      },
    },
  },
  'incite-protest': {
    name: 'Incite Protest',
    type: 'incite-protest',
    fn: executeInciteProtestPlot,
    costPerParticipant: 0,
    requirements: {
      personnel: {
        embeddedAgents: true,
      },
    },
  },
};

export default plotConfig;

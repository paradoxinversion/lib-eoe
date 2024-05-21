import cpuActionNothing from './nothing';
import trainAgents from './trainAgents';

export const cpuActions = {
  nothing: cpuActionNothing,
  trainAgents: trainAgents,
};

export type CpuAction = keyof typeof cpuActions;

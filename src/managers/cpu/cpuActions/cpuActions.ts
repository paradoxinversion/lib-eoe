import cpuActionNothing from './nothing';
import trainAgents from './trainAgents';

const cpuActions = {
  nothing: cpuActionNothing,
  trainAgents: trainAgents,
};

export type CpuAction = keyof typeof cpuActions;

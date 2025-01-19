export type GeneratDomesticCombatEncounterEventParams = {
  zone: string;
  targetedAgents: string[];
  crowd: CrowdSize;
};
export type CrowdSize = 'small' | 'medium' | 'large';

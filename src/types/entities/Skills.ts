export interface Skills {
  /** Factors into recon */
  espionage: number;
  /** Factors into recon */
  disguise: number;
  security: number;
  science: number;
  persuasion: number;
  administration: number;
  leadership: number;
  combat: number;
  medicine: number;
}

export type SkillTypes = keyof Skills;

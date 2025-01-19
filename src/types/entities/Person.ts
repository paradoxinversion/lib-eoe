import { AgentData } from './AgentData';
import { PersonStandardAttributes } from './PersonStandardAttributes';
import { PersonIntelAttributes } from './PersonIntelAttributes';
import { Skills } from './Skills';

export interface Person {
  /** The person's indentifier, prefixed with `p_` */
  id: string;
  /** The ID of the nation the Person is native to */
  nationId: string;
  /** The ID of the Zone this Person calls home */
  homeZoneId: string;
  /** The name of the person. */
  name: string;
  /** If present, data about the peron's agent status */
  agent: AgentData | null;
  /** Whether or not the person is working in a building */
  isPersonnel: boolean;
  residentAt: string | null;
  personnelAt: string | null;
  dead: boolean;
  wealth: number;
  isCaptive: boolean;
  statusEffects: { [x: string]: number };
  standardAttributes: PersonStandardAttributes;
  derivedAttributes: {
    health: {
      currentHealth: number;
      totalHealth: number;
    };
    evasion: number;
    defense: number;
  };
  intelAttributes: PersonIntelAttributes;
  skills: Skills;
  hospitalizedAt: string | null;
}

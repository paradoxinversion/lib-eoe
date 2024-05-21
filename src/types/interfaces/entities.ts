import { BuildingStatusEffects } from '../../statusEffects/building';
import { GoverningOrgStatusEffects } from '../../statusEffects/governingOrg';

/**
 * An interface for entities that can be surveilled
 */
interface IntelligenceSubject {
  intelligenceLevel: number;
}

/**
 * Nations represent groups of regions within a geographical area.
 */
export interface Nation {
  /** The nation's indentifier, prefixed with `n_` */
  id: string;
  /** The name of the nation */
  name: string;
  /** The size (amount of zones) of the nation */
  size: number;
  /** The id of the org that controls the nation */
  organizationId: string;
}

/**
 * Zones represent regions within a nation.
 */
export interface Zone {
  /** The zone's indentifier, prefixed with `z_` */
  id: string;
  /** The name of the zone */
  name: string;
  /** The ID of the nation the zone belongs to */
  nationId: string;
  /** The size (amount of citizens) in the zone */
  size: number;
  /** the wealth value of the zone */
  wealth: number;
  /** The level of knowledge the EOE has on this zone */
  intelligenceLevel: number;
  /** The id of the org that controls the zone */
  organizationId: string;
  /** The level of intelligence the EoE (player's empire) has on the zone */
  intelAttributes: IntelligenceSubject;
}

export interface Skills {
  /** Factors into recon */
  espionage: number;
  /** Factors into recon */
  disguise: number;
  security: number;
  science: number;
  administration: number;
  leadership: number;
  combat: number;
  medicine: number;
}

export type SkillTypes = keyof Skills;

export interface PersonStandardAttributes {
  /** Factors into combat damage */
  strength: number;
  /** Factors into health */
  constitution: number;
  /** Factors into evasion */
  agility: number;
  /** how smart the person is, related to Science */
  intelligence: number;
  /** higher amounts denote less cruelty*/
  empathy: number;
}

export type PersonBasicAttributeTypes = keyof PersonStandardAttributes;

export interface PersonIntelAttributes extends IntelligenceSubject {
  loyalty: number;
  loyalties: {
    [x: string]: number;
  };
}

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

export type AgentDepartment =
  | 'troop'
  | 'administrator'
  | 'scientist'
  | 'overlord'
  | 'doctor';

export interface AgentData {
  /** 0 (troop), 1 (administrator), 2 (scientist), 3 (overlord), 4 (doctor) */
  department: AgentDepartment;
  /** the id of the org this Agent works for */
  organizationId: string;
  /** the amount of money it costs per month to retain the agent */
  salary: number;
  /** the id of the agent commanding this one */
  commanderId: string;
  codename: string;
  embeddedAt: string | null;
}

export interface GoverningOrganization {
  /** The governing body's indentifier, prefixed with `g_` */
  id: string;
  /** The ID of the nation this org governs */
  nationId: string;
  /** Whether or not the org is EVIL. */
  evil: boolean;
  /** The name of the org. */
  name: string;
  /**  */
  wealth: number;
  science: number;
  infrastructure: number;
  totalEvil: number;
  captives: string[];
  statusEffects: GoverningOrgStatusEffects[];
  opinions: {
    /** The org's opinion on another organization, -/+100 */
    [orgId: string]: number;
  };
}

export interface Building {
  id: string;
  organizationId: string;
  name: string;
  zoneId: string;
  personnel: string[];
  type: string;
  basicAttributes: {
    infrastructureCost: number;
    upkeepCost: number;
    maxPersonnel: number;
  };
  resourceAttributes: {
    wealthBonus: number;
    housingCapacity: number;
    scienceBonus: number;
    infrastructure: number;
    hospitalBeds: number;
  };
  intelAttributes: IntelligenceSubject;
  statusEffects: BuildingStatusEffects[];
  /**
   * People iving in the building if an apartment complex,
   * or people admitted for care if a hospital
   */
  inhabitants: string[];
  structure: {
    currentHealth: number;
    totalHealth: number;
  };
}

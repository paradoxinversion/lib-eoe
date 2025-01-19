import { IntelligenceSubject } from './IntelligenceSubject';

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

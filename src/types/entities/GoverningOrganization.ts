import { GoverningOrgStatusEffects } from '../statusEffects';

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

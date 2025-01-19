export interface GenerateZoneOpts {
  /** The ID of the nation the zone belongs to */
  nationId?: string;
  /** The name of the zone. */
  name?: string;
  /** The size (amount of citizens...?) */
  size?: number;
  organizationId?: string;
  intelligenceLevel?: number;
}

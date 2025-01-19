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

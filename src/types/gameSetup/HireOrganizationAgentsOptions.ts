export type HireOrganizationAgentsOptions = {
  orgId: string;
  fullStaffDetail: boolean;
  /**
   * Agents of the organization will staff all possible building
   * positions if true.
   */
  staffIsOrg: boolean;
};

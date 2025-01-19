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

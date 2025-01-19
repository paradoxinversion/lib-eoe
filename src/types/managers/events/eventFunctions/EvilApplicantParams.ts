import { AgentDepartment, Person } from '../../../entities';

export interface EvilApplicantParams {
  recruit: Person;
  department: AgentDepartment;
  organizationId: string;
}

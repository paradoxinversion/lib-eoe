import { Person } from '../../../entities';

export interface ProtestEventParams {
  zone: string;
  targetOrganization: string;
  protestors: Person[];
}

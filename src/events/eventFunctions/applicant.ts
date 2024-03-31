import { Person } from '../../types/interfaces/entities';
import GameEvent from '../GameEvent';

export interface EvilApplicantParams {
  recruit: Person;
  department: number;
  organizationId: string;
}

/**
 * Set parameters for an Evil Applicant event
 */
export function setEvilApplicantParams(
  this: GameEvent,
  { recruit, organizationId, department }: EvilApplicantParams,
) {
  this.params = {
    recruit,
    department,
    organizationId,
  };
}

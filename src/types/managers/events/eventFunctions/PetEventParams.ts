import { PetEventTypes } from './PetEventTypes';

export interface PetEventParams {
  petEvent: PetEventTypes;
  target?: {
    person: string;
    building: string;
  };
  damage?: number;
  message: string;
}

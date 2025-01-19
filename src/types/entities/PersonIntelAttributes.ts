import { IntelligenceSubject } from './IntelligenceSubject';

export interface PersonIntelAttributes extends IntelligenceSubject {
  loyalty: number;
  loyalties: {
    [x: string]: number;
  };
}

import { Person } from '../../../entities';

export type InciteProtestData = {
  protesters: {
    [index: string]: Person;
  };
};

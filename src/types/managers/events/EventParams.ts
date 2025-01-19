import {
  ReconZoneEventParams,
  MonthlyReportEventParams,
  AttackZoneParams,
  IntruderAlertEventParams,
  OccupationalHazardParams,
  ProjectCompleteParams,
  ProtestEventParams,
  EvilApplicantParams,
} from './eventFunctions';

export type EventParams =
  | ReconZoneEventParams
  | EvilApplicantParams
  | MonthlyReportEventParams
  | AttackZoneParams
  | IntruderAlertEventParams
  | OccupationalHazardParams
  | ProjectCompleteParams
  | ProtestEventParams
  | NonNullable<unknown>
  | undefined;

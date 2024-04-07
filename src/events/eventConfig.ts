import GameEvent, { EventConfig } from './GameEvent';
import { evilApplicantEvilConfig } from './eventFunctions/applicant';
import { attackZoneConfig } from './eventFunctions/attackZone';
import { combatEventConfig } from './eventFunctions/combat';
import { intruderAlertEventConfig } from './eventFunctions/intruderAlert';
import { monthlyReportEventConfig } from './eventFunctions/monthlyReport';
import { projectCompleteEventConfig } from './eventFunctions/projectComplete';
import { reconZoneEventConfig } from './eventFunctions/recon';
import { standardReportConfig } from './eventFunctions/standardReport';
import { temperTantrumEventConfig } from './eventFunctions/temperTantrum';
import { wealthModEventConfig } from './eventFunctions/wealthMod';
import { occupationalHazardEventConfig } from './eventFunctions/occupationalHazard';
import { petEventConfig } from './eventFunctions/petEvent';
/**
 * Sets `event.params` to an empty object. Should be used for
 * events that take no parameters.
 */
export function setEmptyParams(this: GameEvent) {
  this.params = {};
}
export interface EventConfigMap {
  [x: string]: EventConfig;
}
/**
 * Event configuration to be used with GameEvents
 */
const eventConfig: EventConfigMap = {
  recruit: evilApplicantEvilConfig,
  standardReport: standardReportConfig,
  combat: combatEventConfig,
  wealthMod: wealthModEventConfig,
  attackZone: attackZoneConfig,
  reconZone: reconZoneEventConfig,
  monthlyReport: monthlyReportEventConfig,
  intruder: intruderAlertEventConfig,
  projectComplete: projectCompleteEventConfig,
  temperTantrum: temperTantrumEventConfig,
  occupationalHazard: occupationalHazardEventConfig,
  petEvent: petEventConfig,
};

export default eventConfig;

import { attackZone } from './plotFunctions/attackZone';
import { executeReconPlot } from './plotFunctions/recon';
import { ActivityConfig } from '../activities/activityConfig';
const plotConfig: { [x: string]: ActivityConfig } = {
  'attack-zone': {
    name: 'Attack Zone',
    type: 'attack-zone',
    fn: attackZone,
  },
  'recon-zone': {
    name: 'Recon',
    type: 'recon-zone',
    fn: executeReconPlot,
  },
};

export default plotConfig;

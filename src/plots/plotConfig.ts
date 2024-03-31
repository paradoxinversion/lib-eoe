import { ActivityConfig } from '../plots';
import { attackZone } from './plotFunctions/attackZone';
import { recon } from './plotFunctions/recon';

const plotConfig: { [x: string]: ActivityConfig } = {
  'attack-zone': {
    name: 'Attack Zone',
    type: 'attack-zone',
    fn: attackZone,
  },
  'recon-zone': {
    name: 'Recon',
    type: 'recon-zone',
    fn: recon,
  },
};

export default plotConfig;

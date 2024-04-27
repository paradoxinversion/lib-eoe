import { GameManager } from '../GameManager';
import { getBuildings, getInfrastructureLoad } from '../buildings';
import { getInfrastructure, getOrgResources } from '../organization';

export const getInfrastructurePercentage = (organizationId: string) => {
  const infrastructureOutput = getBuildings({
    organizationId,
    type: 'office',
  }).reduce((total, building) => {
    const base = 0;

    const personnelBonuses = building.personnel.reduce((total, personId) => {
      return (total =
        total +
        GameManager.getInstance().gameData.people[personId].skills
          .administration);
    }, 0);
    return total + base + personnelBonuses;
  }, 0);

  const percentage =
    (infrastructureOutput / getInfrastructureLoad(organizationId)) * 100;

  return percentage < 100 ? percentage : 100;
};

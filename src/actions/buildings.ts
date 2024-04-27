import { GameManager } from '../GameManager';

export const modifyBuildingCurrentHealth = (
  buildingId: string,
  amt: number,
) => {
  const { gameData } = GameManager.getInstance();
  const building = { ...gameData.buildings[buildingId] };
  let update;
  let currentBuildingHealth = (building.structure.currentHealth += amt);
  if (building.structure.currentHealth > building.structure.totalHealth) {
    currentBuildingHealth = building.structure.totalHealth;
  }
  update = {
    buildings: {
      [buildingId]: {
        structure: {
          currentHealth: currentBuildingHealth,
        },
      },
    },
  };

  return update;
};

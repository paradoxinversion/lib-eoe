import actions from '.';
import { GameManager } from '../managers/game/GameManager';

const getNationCitizens = (nationId: string) => {
  return actions.people.getPeople({
    nation: {
      nationId,
    },
  });
};

interface GetNationsParams {
  isEvilEmpire?: boolean;
}

const getNations = ({ isEvilEmpire = false }: GetNationsParams) => {
  const { gameData } = GameManager.getInstance();
  return Object.values(gameData.nations).filter((nation) => {
    if (isEvilEmpire && nation.id !== gameData.player.empireId) {
      return false;
    }
    return true;
  });
};

export default { getNationCitizens, getNations };

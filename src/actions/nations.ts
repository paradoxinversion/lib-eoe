import { GameManager } from './GameManager';

const getNationCitizens = (nationId: string) => {
  const { gameData } = GameManager.getInstance();
  const peopleArray = Object.values(gameData.people);
  return peopleArray.filter((person) => person.nationId === nationId);
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

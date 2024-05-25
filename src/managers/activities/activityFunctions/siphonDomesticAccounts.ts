import { GameManager } from '../../game/GameManager';
import people from '../../../actions/people';
import { getEvilEmpire } from '../../../organization';
import utilities from '../../../utilities';

const siphonDomesticAccounts = (participantArray: string[]) => {
  if (participantArray.length === 0) {
    return null;
  }
  participantArray.forEach(() => {
    // Choose a citizen in the nation
    const citizens = people.getPeople({
      nation: {
        nationId: GameManager.getInstance().gameData.player.empireId,
      },
      agentFilter: {
        excludeAgents: true,
      },
    });
    const citizen = citizens[utilities.randomInt(0, citizens.length - 1)];
    const citizenWealth = citizen.wealth;

    const siphonAmt = utilities.randomInt(0, 5);
    const newWealth = citizenWealth - siphonAmt;
    // Update the citizen's wealth
    const updatedCitizen = {
      ...citizen,
      wealth: newWealth,
    };
    const empire = getEvilEmpire();
    const updatedEmpire = {
      ...empire,
      wealth: empire.wealth + siphonAmt,
    };

    GameManager.getInstance().updateGameData({
      people: {
        [updatedCitizen.id]: updatedCitizen,
      },
      governingOrganizations: {
        [updatedEmpire.id]: updatedEmpire,
      },
    });
  });
};

export default siphonDomesticAccounts;

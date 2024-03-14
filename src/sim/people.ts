import { GameData, GameManager } from '../GameManager';
import { updateLoyalty } from '../actions/people';
import { Person, StatusEffect } from '../types/interfaces/entities';
import { randomInt } from '../utilities';

interface SimulatedActivity {
  name: string;
  text: string;
  requirements: {
    loyalty?: 'low' | 'average' | 'high';
    employedCitizen?: boolean;
    wealth?: 'low' | 'medium' | 'high' | 'not-broke';
    hasStatusEffect?: StatusEffect;
  };
  handler?: (gameManager: GameManager, person: Person) => Partial<GameData>;
}

const simActivities: { [x: string]: SimulatedActivity } = {
  laze: {
    name: 'laze',
    text: 'lazed at home',
    requirements: {},
  },
  work: {
    name: 'work',
    text: 'went to work',
    requirements: {
      employedCitizen: true,
    },
    handler: (gameManager: GameManager, person: Person): Partial<GameData> => {
      const pay = person.basicAttributes.intelligence;
      console.info(`${person.name} got paid $${pay}`);
      return {
        people: {
          [person.id]: {
            ...person,
            wealth: person.wealth + pay,
          },
        },
      };
    },
  },
  protest: {
    name: 'protest',
    text: 'went protesting',
    requirements: {
      loyalty: 'low',
    },
  },
  walk: {
    name: 'walk',
    text: 'went for a walk',
    requirements: {},
  },
  bar: {
    name: 'bar',
    text: 'went to the bar',
    requirements: {
      wealth: 'not-broke',
    },
    handler(gameManager, person) {
      const cost = randomInt(0, 10);
      console.info(`${person.name} spent $${cost}`);
      return {
        people: {
          [person.id]: {
            ...person,
            wealth: person.wealth - cost,
          },
        },
      };
    },
  },
  ['conspiracy-binge']: {
    name: 'conspiracy-binge',
    text: 'binged on conspiracy theories',
    requirements: {
      hasStatusEffect: 'conspiracy-nut',
    },
    handler(gameManager, person) {
      const orgId =
        gameManager.gameData.zones[person.homeZoneId].organizationId;
      const p = updateLoyalty(person, orgId, -randomInt(0, 3));
      console.info(`${person.name} lost loyalty`);
      return p;
    },
  },
};

const chooseActivity = (
  gameManager: GameManager,
  person: Person,
  completedActivities: string[],
) => {
  const governingOrgId =
    gameManager.gameData.nations[person.nationId].organizationId;
  const activityOptions = Object.values(simActivities).filter((simActivity) => {
    // filter out activities that have been done already
    // if (completedActivities.includes(simActivity.name)) {
    //   console.log(simActivity.name);
    //   return false;
    // }
    const { requirements } = simActivity;
    if (
      requirements.loyalty === 'low' &&
      person.intelAttributes.loyalties[governingOrgId] < 40
    ) {
      return false;
    }

    if (requirements.employedCitizen && !person.isPersonnel) {
      return false;
    }

    if (requirements.wealth === 'high' && person.wealth < 1000) {
      return false;
    }

    if (requirements.wealth === 'medium' && person.wealth < 500) {
      return false;
    }

    if (requirements.wealth === 'low' && person.wealth < 50) {
      return false;
    }

    if (requirements.wealth === 'not-broke' && person.wealth < 10) {
      return false;
    }

    if (
      requirements.hasStatusEffect &&
      !person.statusEffects.includes(requirements.hasStatusEffect)
    ) {
      return false;
    }

    return true;
  });

  return activityOptions[randomInt(0, activityOptions.length - 1)];
};

interface SimulatedActivityResolution {
  updatedGamedata?: Partial<GameData>;
  activity?: string;
}

export const simulateActivity = (
  gameManager: GameManager,
  person: Person,
  completedActivities: string[],
): SimulatedActivityResolution | null => {
  const simActivity = chooseActivity(gameManager, person, completedActivities);
  console.log(`${person.name} ${simActivity.text}`);
  completedActivities.push(simActivity.name);
  if (simActivity.handler) {
    return {
      updatedGamedata: simActivity.handler(gameManager, person),
      activity: simActivity.name,
    };
  }
  return {};
};

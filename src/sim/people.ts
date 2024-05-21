import { GameData, GameManager } from '../GameManager';
import { updateLoyalty } from '../actions/people';
import { PersonStatusEffect } from '../statusEffects/person';
import { Person, SkillTypes } from '../types/interfaces/entities';
import { randomInt } from '../utilities';

interface SimulatedActivity {
  name: string;
  text: string;
  requirements: {
    loyalty?: 'low' | 'average' | 'high';
    employedCitizen?: boolean;
    wealth?: 'low' | 'medium' | 'high' | 'not-broke';
    hasStatusEffect?: PersonStatusEffect;
  };
  handler?: (person: Person) => Partial<GameData>;
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
    handler: (person: Person): Partial<GameData> => {
      const pay = person.standardAttributes.intelligence;
      // console.info(`${person.name} got paid $${pay}`);
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
    handler(person) {
      const cost = randomInt(0, 10);
      // console.info(`${person.name} spent $${cost}`);
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
    handler(person) {
      const orgId =
        GameManager.getInstance().gameData.zones[person.homeZoneId]
          .organizationId;
      const p = updateLoyalty(person, orgId, -randomInt(0, 3));
      // console.info(`${person.name} lost loyalty`);
      return p;
    },
  },
  ['create-art']: {
    name: 'create-art',
    text: 'created art',
    requirements: {
      wealth: 'low',
    },
    handler(person) {
      const pay = randomInt(0, 10);
      // console.info(`${person.name} sold art for $${pay}`);
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
  ['go-shopping']: {
    name: 'go-shopping',
    text: 'went shopping',
    requirements: {
      wealth: 'medium',
    },
    handler(person) {
      const cost = randomInt(0, 100);
      // console.info(`${person.name} spent $${cost}`);
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
  ['stare-cry']: {
    name: 'stare-cry',
    text: 'stared into the void and cried',
    requirements: {},
  },
  ['start-project']: {
    name: 'start-project',
    text: 'started a project',
    requirements: {},
  },
};

const chooseActivity = (person: Person, completedActivities: string[]) => {
  const governingOrgId =
    GameManager.getInstance().gameData.nations[person.nationId].organizationId;
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
      !person.statusEffects[requirements.hasStatusEffect]
    ) {
      return false;
    }

    return true;
  });

  return activityOptions[randomInt(0, activityOptions.length - 1)];
};

export interface SimulatedActivityResolution {
  /**
   * The game data that should be updated as a result of the activity.
   * This data may include the person, and other entities that are affected
   * by their actions.
   */
  updatedGamedata?: Partial<GameData>;
  activity?: string;
}

const simulateActivity = (
  person: Person,
  completedActivities: string[],
): SimulatedActivityResolution | null => {
  const simActivity = chooseActivity(person, completedActivities);
  // console.log(`${person.name} ${simActivity.text}`);\
  // gameManager.updateSimActionLog(person.id, simActivity.name);
  completedActivities.push(simActivity.name);
  if (simActivity.handler) {
    return {
      updatedGamedata: simActivity.handler(person),
      activity: simActivity.name,
    };
  }
  return {};
};

export const getSkillValue = (personId: string, skill: SkillTypes) => {
  const person = GameManager.getInstance().gameData.people[personId];
  if (person.skills[skill as keyof typeof person.skills]) {
    return person.skills[skill as keyof typeof person.skills];
  }
  // If no skill is found, return null
  return null;
};

export const getGroupSkillValue = (personIds: string[], skill: SkillTypes) => {
  const skillValues = personIds.map((personId) =>
    getSkillValue(personId, skill),
  );
  return skillValues.reduce((acc, val) => acc! + (val || 0), 0)!;
};

export default { simActivities, simulateActivity };

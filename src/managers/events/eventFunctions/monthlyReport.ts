import { GameManager } from '../../game/GameManager';
import buildings from '../../../actions/buildings';
import organization from '../../../actions/organization';
import {
  GoverningOrganization,
  Person,
} from '../../../types/interfaces/entities';
import GameEvent from '../GameEvent';
import people from '../../../actions/people';

export interface MonthlyReportEventParams {
  expenses: {
    payroll: number;
    upkeep: number;
  };
}

export const generateMonthlyReportEvent = () => {
  const { gameData } = GameManager.getInstance();
  const { organizationId } = gameData.player;
  const upkeep = buildings.getUpkeep(organizationId);
  const payroll = organization.getPayroll(organizationId);
  return new GameEvent(monthlyReportEventConfig, {
    expenses: {
      payroll,
      upkeep,
    },
  });
};
/**
 *
 */
function setMonthlyReportParams(
  this: GameEvent,
  { expenses }: MonthlyReportEventParams,
) {
  this.params = {
    expenses,
  };
}

export interface MonthlyReportEventResolveArgs {
  payroll: {
    /** Amount of Agent's salary paid */
    [x: string]: number;
  };
  upkeep: {
    /** Amount of upkeep paid */
    [x: string]: number;
  };
}

function resolveMonthlyReport(
  this: GameEvent,
  resolveArgs: {
    buildingUpkeep: { [x: string]: number };
    agentPayroll: { [x: string]: number };
  },
) {
  const { gameData } = GameManager.getInstance();
  const {
    gameData: {
      player: { organizationId },
    },
  } = GameManager.getInstance();

  let updatedGameData: {
    governingOrganizations: { [x: string]: GoverningOrganization };
    people: { [x: string]: Person };
  } = {
    governingOrganizations: {},
    people: {},
  };

  const org: GoverningOrganization = {
    ...gameData.governingOrganizations[organizationId],
  };
  const upkeepTotal = Object.values(resolveArgs.buildingUpkeep).reduce(
    (total, currentExpense) => {
      return total + currentExpense;
    },
    0,
  );
  const payrollTotal = Object.values(resolveArgs.agentPayroll).reduce(
    (total, currentExpense) => {
      return total + currentExpense;
    },
    0,
  );

  const expensesTotal = upkeepTotal + payrollTotal;

  // Take the expenses from the organization's wealth
  org.wealth = org.wealth - expensesTotal;
  updatedGameData.governingOrganizations[org.id] = org;
  GameManager.getInstance().updateGameData(updatedGameData);

  // handle unpaid people and upkeep
  Object.entries(resolveArgs.buildingUpkeep).forEach(
    ([buildingId, expensePaid]) => {
      if (!expensePaid) {
        // handle unpaid upkeep
      }
    },
  );

  Object.entries(resolveArgs.agentPayroll).forEach(([agentId, expensePaid]) => {
    if (expensePaid === 0) {
      updatedGameData = {
        ...updatedGameData,
        people: {
          ...updatedGameData.people,
          [agentId]: people.addPersonStatusEffect(
            gameData.people[agentId],
            'stiffed',
          ).people![agentId],
        },
      };
    } else {
      if (gameData.people[agentId].statusEffects.stiffed) {
        updatedGameData = {
          ...updatedGameData,
          people: {
            ...updatedGameData.people,
            [agentId]: people.removePersonStatusEffect(
              gameData.people[agentId],
              'stiffed',
            ).people![agentId],
          },
        };
      }
    }
  });

  this.eventData = {
    type: 'monthly-report',
    resolution: {
      updatedGameData: updatedGameData,
    },
  };

  return this.eventData;
}

export const monthlyReportEventConfig = {
  name: 'Monthly Report',
  setParams: setMonthlyReportParams,
  resolve: resolveMonthlyReport,
  getEventText(this: GameEvent) {
    this.eventText = 'The month has ended.';
  },
  icon: 'paid',
  type: 'monthlyReport',
  forceStop: true,
};

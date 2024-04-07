import { GameManager } from '../../GameManager';
import {
  addPersonStatusEffect,
  removePersonStatusEffect,
} from '../../actions/people';
import { getUpkeep } from '../../buildings';
import { getExpenses, getOrgResources, getPayroll } from '../../organization';
import { GoverningOrganization, Person } from '../../types/interfaces/entities';
import GameEvent from '../GameEvent';

export interface MonthlyReportEventParams {
  income: number;
  expenses: number;
}

export const generateMonthlyReportEvent = (gameManager: GameManager) => {
  const { gameData } = gameManager;
  const { organizationId } = gameData.player;
  const upkeep = getUpkeep(gameManager, organizationId);
  const payroll = getPayroll(gameManager, organizationId);
  return new GameEvent(monthlyReportEventConfig, {
    expenses: {
      payroll,
      upkeep,
    },
    income: {
      buildingWealth: getOrgResources(gameManager, organizationId).wealth,
    },
  });
};
/**
 *
 */
function setMonthlyReportParams(
  this: GameEvent,
  { income, expenses }: MonthlyReportEventParams,
) {
  this.params = {
    income,
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
  gameManager: GameManager,
  resolveArgs: {
    buildingUpkeep: { [x: string]: number };
    agentPayroll: { [x: string]: number };
  },
) {
  const { gameData } = gameManager;
  const {
    gameData: {
      player: { organizationId },
    },
  } = gameManager;

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
  const { wealth } = getOrgResources(gameManager, organizationId);

  const netTotal = wealth - expensesTotal;
  org.wealth += netTotal;
  updatedGameData.governingOrganizations[org.id] = org;
  gameManager.updateGameData(updatedGameData);

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
          [agentId]: addPersonStatusEffect(
            gameManager,
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
            [agentId]: removePersonStatusEffect(
              gameManager,
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

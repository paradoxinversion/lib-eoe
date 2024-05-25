import GameEvent from '../GameEvent';
/**
 * Create and return a new Standard Report Game Event
 */
export const generateStandardReportEvent = () => {
  return new GameEvent(standardReportConfig);
};
/**
 * Resolve a Standard Report Event
 */
export function resolveStandardReport(this: GameEvent) {
  this.eventData = {
    type: 'standard-report',
    resolution: {
      updatedGameData: {},
    },
  };

  return this.eventData;
}

export const standardReportConfig = {
  name: 'Standard Report',
  resolve: resolveStandardReport,
  getEventText(this: GameEvent) {
    this.eventText = `There is nothing special to report.`;
  },
  icon: 'info',
  type: 'standardReport',
  forceStop: false,
};

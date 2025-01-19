import GameEvent from '../GameEvent';

export const combatEventConfig = {
  name: 'Combat',
  getEventText(this: GameEvent) {
    this.eventText = `Combat has occured!`;
  },
  resolve: () => {},
  icon: 'warning',
  type: 'combat',
  forceStop: true,
};

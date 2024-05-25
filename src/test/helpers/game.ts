import gameSetup from '../../gameSetup';

const createTestGame = () => {
  gameSetup.newGame({
    overlordName: 'Test Overlord',
    pet: true,
    startWithFullStaff: false,
    takePrisoners: false,
  });
};

export default {
  createTestGame,
};

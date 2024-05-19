export type GameConfig = {
  /**
   * How many CPU players are in the game.
   * There will be one nation per CPU player.
   * */
  cpuPlayers: number;
  /** World Generation Options */
  worldGen: {
    startDate: string;
    /** Options for nation generation */
    nations: {
      /** Maximum size of a nation */
      maxSize: number;
      /** Minimum size of a nation */
      minSize: number;
    };
    /** Options for Zone generation */
    zones: {
      /** The max amount of people generated in the zone */
      maxSize: number;
      /** The min amount of people generated in the zone */
      minSize: number;
      /** The minimum wealth of a zone */
      minWealth: number;
      /** The maximum wealth of a zone */
      maxWealth: number;
      /** The default intelligence level of a zone */
      defaultIntelligenceLevel: number;
    };
    /** Options for People generation */
    people: {
      /** The default intelligence level of a person */
      defaultIntelligenceLevel: number;
      /** The minimum attribute value of a person */
      attributeMin: number;
      /** The maximum attribute value of a person */
      attributeMax: number;
      /** The minimum skill value of a person */
      minSkill: number;
      /** The maximum skill value of a person */
      maxSkill: number;
      minWealth: number;
      maxWealth: number;
    };
    governingOrganization: {
      /** The default starting wealth of a governing organization */
      defaultStartWealth: number;
    };
    buildings: {
      minWealthBonus: number;
      maxWealthBonus: number;
      minHousingCapacity: number;
      maxHousingCapacity: number;
      minInfrastuctureBonus: number;
      maxInfrastuctureBonus: number;
      minHospitalBeds: number;
      maxHospitalBeds: number;
      minScienceBonus: number;
      maxScienceBonus: number;
      minSize: number;
      maxSize: number;
      /** A multiplier <1 to determine how many buildings are created */
      buildingPopulationMultiplier: number;
      generationFrequency: {
        bank: number;
        apartment: number;
        laboratory: number;
        office: number;
        hospital: number;
      };
    };
    startingAgents: {
      defaultStartAmount: number;
    };
  };
  agents: {
    leadershipCommandMultiplier: number;
  };
  shufflebags: {
    [bagName: string]: {
      [bagValue: string]: number;
    };
  };
};

const configDefaults: GameConfig = {
  cpuPlayers: 1,
  worldGen: {
    startDate: '1/1/2000',
    nations: {
      maxSize: 5,
      minSize: 3,
    },
    zones: {
      maxSize: 100,
      minSize: 10,
      minWealth: 1,
      maxWealth: 5,
      defaultIntelligenceLevel: 25,
    },
    people: {
      defaultIntelligenceLevel: 25,
      attributeMin: 1,
      attributeMax: 10,
      minSkill: 1,
      maxSkill: 60,
      minWealth: 50,
      maxWealth: 500,
    },
    governingOrganization: {
      defaultStartWealth: 50000,
    },
    buildings: {
      buildingPopulationMultiplier: 0.02,
      minWealthBonus: 100,
      maxWealthBonus: 250,
      minHousingCapacity: 30,
      maxHousingCapacity: 50,
      minInfrastuctureBonus: 15,
      maxInfrastuctureBonus: 30,
      minHospitalBeds: 10,
      maxHospitalBeds: 30,
      minScienceBonus: 1,
      maxScienceBonus: 10,
      minSize: 1,
      maxSize: 5,
      generationFrequency: {
        bank: 2,
        apartment: 4,
        laboratory: 1,
        office: 3,
        hospital: 1,
      },
    },
    startingAgents: {
      defaultStartAmount: 10,
    },
  },
  agents: {
    leadershipCommandMultiplier: 0.3,
  },
  shufflebags: {
    eventShufflebag: {
      EvilApplicantEvent: 1,
      WealthModEvent: 1,
      nothing: 30,
      IntruderAlert: 1,
      AngryAdminEvent: 1,
      OccupationalHazard: 1,
      PetEvent: 1,
    },
    skillBaseShufflebag: {
      Expert: 1,
      Professional: 3,
      Skilled: 8,
      Novice: 12,
      Amateur: 18,
    },
    attributeBaseShufflebag: {
      'Very High': 2,
      High: 4,
      Average: 12,
      Low: 18,
      'Very Low': 8,
    },
  },
};

const settings = (() => {
  return configDefaults;
})();

export default settings;


export interface Nation {
    /** The nation's indentifier, prefixed with `n_` */
    id: string;
    /** The name of the nation */
    name: string;
    /** The size (amount of zones) of the nation */
    size: number;
    organizationId: string;
}

export interface Zone {
    /** The zone's indentifier, prefixed with `z_` */
    id: string;
    /** The name of the zone */
    name: string;
    /** The ID of the nation the zone belongs to */
    nationId: string;
    /** The size (amount of citizens) in the zone */
    size: number;
    /** the wealth value of the zone */
    wealth: number;
    /** The level of knowledge the EOE has on this zone */
    intelligenceLevel: number;
    organizationId: string;
}

export interface Person {
    /** The person's indentifier, prefixed with `p_` */
    id: string;
    /** The ID of the nation the Person belongs to */
    nationId: string;
    /** The ID of the Zone this Person calls home */
    homeZoneId: string;
    /** The name of the person. */
    name: string;
    /**  how smart the person is, related to Administration */
    administration: number;
    /** How capable of combat the character is, related to Evil Troops */
    combat: number;
    /** how smart the person is, related to Science */
    intelligence: number;
    /** how likely the person is to remain loyal to their nation/org */
    loyalty: number;
    /** the person's max health */
    health: number;
    /** the person's current health */
    currentHealth: number;
    /** If present, data about the peron's agent status */
    agent?: AgentData,
    /** the max possible agents the agent can manage */
    leadership: number;
    /** The level of knowledge the EOE has on this person */
    intelligenceLevel: number;
    /** Whether or not the person is working in a building */
    isPersonnel: boolean;
}

export interface AgentData {
    /** 0 (troop), 1 (administrator), or 2 (scientist) */
    department: number;
    /** the id of the org this Agent works for */
    organizationId: string;
    /** the amount of money it costs per month to retain the agent */
    salary: number;
    /** the id of the agent commanding this one */
    commanderId: string;
}

export interface GoverningOrganization {
    /** The governing body's indentifier, prefixed with `g_` */
    id: string;
    /** The ID of the nation this org governs */
    nationId: string;
    /** Whether or not the org is EVIL. */
    evil: boolean;
    /** The name of the org. */
    name: string;
    /**  */
    wealth: number;
    science: number;
    infrastructure: number;
    totalEvil: number;
}

export interface Building {
    id: string;
    organizationId: string;
    name: string;
    zoneId: string;
    personnel: string[];
    wealthBonus: number;
    infrastructureCost: number;
    upkeepCost: number;
    housingCapacity: number;
    type: number;
    maxPersonnel: number;
}
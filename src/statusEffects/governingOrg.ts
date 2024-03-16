/**
 * Governing Org Status Effects
 */

const statusEffects = {
    'centralized-telecommunications': {
        name: 'centralized-tellecommunications',
        description: 'The nation has centralized telecommunications.',
        requires: [],
        prohibits: []
    },
    'hyperrefractive-materials': {
        name: 'hyperrefractive-materials',
        description: 'The nation has hyperrefractive materials.',
        requires: [],
        prohibits: []
    },
    'counterfeiter': {
        name: 'counterfeiter',
        description: 'The nation is capable of counterfeiting.',
        requires: [],
        prohibits: []
    },
    'missile-pigeons': {
        name: 'missile-pigeons',
        description: 'The nation can utilize pigeon guided missiles.',
        requires: [],
        prohibits: []
    },
    'pigeon-missiles': {
        name: 'pigeon-missiles',
        description: 'The nation can utilize missile guided pigeons.',
        requires: [],
        prohibits: []
    },
    'encryption-protocols': {
        name: 'encryption-protocols',
        description: 'The nation has encryption protocols.',
        requires: [],
        prohibits: []
    },
    'clear-visors': {
        name: 'clear-visors',
        description: 'The org utilizes clear helmet visors.',
        requires: [],
        prohibits: []
    },
    
}

export type GoverningOrgStatusEffects = keyof typeof statusEffects;
export default statusEffects;
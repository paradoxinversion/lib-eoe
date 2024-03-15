
const statusEffects = {
    'centralized-tellecommunications': {
        name: 'centralized-tellecommunications',
        description: 'The nation has centralized telecommunications.'
    },
    'hyperrefractive-materials': {
        name: 'hyperrefractive-materials',
        description: 'The nation has hyperrefractive materials.'
    },
    'counterfeiter': {
        name: 'counterfeiter',
        description: 'The nation is capable of counterfeiting.'
    },
    'missile-pigeons': {
        name: 'missile-pigeons',
        description: 'The nation can utilize pigeon guided missiles.'
    },
    'pigeon-missiles': {
        name: 'pigeon-missiles',
        description: 'The nation can utilize missile guided pigeons.'
    },
    'encryption-protocols': {
        name: 'encryption-protocols',
        description: 'The nation has encryption protocols.'
    },
}

export type GoverningOrgStatusEffects = keyof typeof statusEffects;
export default statusEffects;
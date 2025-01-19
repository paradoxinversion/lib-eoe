export interface PersonStandardAttributes {
  /** Factors into combat damage */
  strength: number;
  /** Factors into health */
  constitution: number;
  /** Factors into evasion */
  agility: number;
  /** how smart the person is, related to Science */
  intelligence: number;
  /** higher amounts denote less cruelty*/
  empathy: number;
}

export type PersonBasicAttributeTypes = keyof PersonStandardAttributes;

/** Basic parameters common to any plot */
export interface PlotParamsStandard {
  /** IDs of Agents executing the plot */
  participants: string[];
  /** IDs of the zone targeted in the plot */
  targetZone?: string;
}

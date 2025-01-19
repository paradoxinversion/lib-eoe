/**
 * The status of a science project
 */
export interface ScienceProjectStatus {
  /** The indexName of the science project */
  indexName: string;
  /** The amount of science applied toward the project */
  accumulatedScience: number;
  targetScience?: number;
  complete: boolean;
  /** The  laboratory completing the work. All projects must have an associated Laboratory.*/
  laboratory: string;
  daysRemaining: number;
}

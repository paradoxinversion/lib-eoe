import { GameManager } from '../GameManager';
import { ActivityConfig, Plot } from '../plots';
export interface PlotResolution {
  plot: Plot;
  resolution: any;
}
export class PlotManager {
  plotQueue: Plot[];
  currentPlot: number;
  plots: ActivityConfig[];
  plotResolutions: PlotResolution[];
  constructor() {
    /**
     * @type {Plot[]}
     */
    this.plotQueue = [];
    this.currentPlot = 0;
    this.plots = [];
    this.plotResolutions = [];
  }

  /**
   * Set the game plots (not individual playerp lots)
   */
  setPlots(plots: ActivityConfig[]) {
    this.plots = plots;
  }

  /**
   * Remove all plots
   */
  clearPlots() {
    this.plots = [];
  }

  /**
   * Add a plot to the queue
   * @param {Plot} plot
   */
  addPlot(plot: Plot) {
    this.plotQueue.push(plot);
  }

  /**
   * Replaces the current plot queue with the parameter array
   * @param {Plot[]} plotQueue
   */
  setPlotQueue(plotQueue: Plot[]) {
    this.plotQueue = plotQueue;
  }

  /**
   * Remove all plots from the plot queue
   */
  clearPlotQueue() {
    this.plotQueue = [];
    this.plotResolutions = [];
  }

  /**
   * Execute a plot, returning...
   */
  executePlot(plot: Plot, gameManager: GameManager): PlotResolution {
    return plot.executePlot(gameManager);
  }

  /**
   * Executes all plots in the queue. Adds each resolution
   * to the plot's `plotResolutions` property. Returns
   * the resolutions.
   */
  executePlots(gameManager: GameManager): PlotResolution[] {
    this.plotQueue.forEach((plot) => {
      this.plotResolutions.push({
        plot,
        resolution: this.executePlot(plot, gameManager),
      });
    });
    return this.plotResolutions;
  }

  /**
   * Return a JSON compatible collection of activities
   * and their participants
   */
  serializePlots() {
    const plots = this.plotQueue.reduce((serializedPlots: Plot[], plot) => {
      serializedPlots.push(plot);
      return serializedPlots;
    }, []);

    return plots;
  }
}

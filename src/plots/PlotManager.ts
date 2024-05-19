import { GameManager } from '../GameManager';
import { ActivityConfig } from '../activities/activityConfig';
import Plot from './Plot';
import { PlotConfig } from './plotConfig';
export interface PlotResolution {
  plot: Plot;
  resolution: any;
}
export class PlotManager {
  private static instance: PlotManager;
  plotQueue: Plot[];
  currentPlot: number;
  plots: PlotConfig[];
  plotResolutions: PlotResolution[];
  constructor() {
    console.log('Plot Manager Initialized');
    /**
     * @type {Plot[]}
     */
    this.plotQueue = [];
    this.currentPlot = 0;
    this.plots = [];
    this.plotResolutions = [];
  }
  public static getInstance(): PlotManager {
    if (!PlotManager.instance) {
      PlotManager.instance = new PlotManager();
    }

    return PlotManager.instance;
  }

  /**
   * Set the game plots (not individual playerp lots)
   */
  setPlots(plots: PlotConfig[]) {
    this.plots = plots;
  }

  /**
   * Remove all plots
   */
  clearPlots() {
    this.plots = [];
  }

  removePlot(index: number) {
    this.plotQueue.splice(index, 1);
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
  executePlot(plot: Plot): PlotResolution {
    return plot.executePlot();
  }

  /**
   * Executes all plots in the queue. Adds each resolution
   * to the plot's `plotResolutions` property. Returns
   * the resolutions.
   */
  executePlots(): PlotResolution[] {
    this.plotQueue.forEach((plot) => {
      this.plotResolutions.push({
        plot,
        resolution: this.executePlot(plot),
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

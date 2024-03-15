
import { GameManager } from "../GameManager";
import { ScienceProject, ScienceProjectMap, ScienceProjectStatus } from "./scienceProjects";

/** The manager for all science projects in the game */
export class ScienceManager{
    /** The list of available science projects in the game */
    PROJECTS: ScienceProjectMap = {};
    /** The list of projects that have been started */
    activeProjects: ScienceProjectStatus[] = [];
    constructor(projects: ScienceProjectMap, activeProjects: ScienceProjectStatus[] = []){
        this.PROJECTS = projects;
        activeProjects = activeProjects;
    }

    /** Start a science project */
    startProject(gameManager: GameManager, projectIndex: string){
        const project = this.PROJECTS[projectIndex];
        if (project === undefined) throw new Error(`Project ${projectIndex} does not exist`);
        const status: ScienceProjectStatus = project.startHandler(gameManager);
        // this.activeProjects.push(status);
        this.activeProjects = [...this.activeProjects, status];
    }

    /** Complete a science project */
    completeProject(gameManager: GameManager, projectName: string){
        const projectConstant = this.PROJECTS[projectName];
        const project = this.activeProjects.find(p => p.name === projectName)!;
        const result = projectConstant.completeHandler(project);
        this.activeProjects = this.activeProjects.filter(p => p.name !== projectName);
        return result;
    }
}
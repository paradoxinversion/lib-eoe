SCIENCE_PROJECTS defines blueprintsfor the projects available in the game. These blueprints include start, progress, and complete functions. For completion, projects require an amount of science points, and zero or more days to pass (representative of the time it takes to implement something, even with prior knowledge).

When a project is elected, the data properties of the project should be copied to a new object. All projects must have an associated lab. The lab is also added to this object. 

Each lab accumulates science points. During an active project, projects with assigned labs consume (first) previously accumulated science at that lab and (second) lab science output until the project is completed. While a science project is active, a lab cannot be selected for other projects. The lab's science should be updated on each status invocation.

The complete function should apply the effects of the project, clear the active project from the list/queue, and free up the lab. 

Each function should update game data and pass back some progress information.

Science project definitions should be available from the gameManager (gameManager.scienceManager.PROJECT_DEFINITIONS)
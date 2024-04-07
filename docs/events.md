# Events

Events are situations that occur in the game. Some events have options for the player to choose from in response to them. These events are generally assumed to have already happened by the time the player has the option to respond.

## Event Definitions

Each Game Event requires a Game Event Configuration object and some code to support the event.

### Event Definition

### Event Definition Properties

name - The name of the event, to be shown to the player
icon - the icon to associate with the event. icons should be chosen categorically. 

### Event Definition Functions
Set Params
Each event function has a function to set its parameters. These functions should not contain event execution logic (ie, modification of game entities).

Resolve
Each event object definition should have a resolve function. This function is responsible for modifying game entities and committing changes.

## GameEvent

This is the class used for Game Events.

Properties

| Property  | Description                                                                                                                           |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| eventName | the name of the event, as shown in the client app                                                                                     |
| eventData | An Object of accumulated data relevent to the event. This object was meant to be referenced at runtime and act as a resolution value. |
| params    | A key-value map of parameters for setting up the event. Parameters can be any type of object.                                         |

| Method            | Description                                       |
| ----------------- | ------------------------------------------------- |
| setParams(params) | A function that sets the parameters of the event. |
| getEventText()    | Sets an event's `eventText`, using params         |
| resolveEvent      |                                                   |

Handling a GameEvent takes two steps. The first step is showing the user relevant information according the data supplied by the event. This step is largely handled by the client. The second step is resolving the event, in which the client may return some data with which to resolve the event. Event resolution happens via `resolveEvent`, and once that has been run, the event is considered resolved. Resolved events should not be run again.

GameEvents are managed by the `GameEventQueue`

### GameEvent Methods

executeEvent()

This method is responsible for handling the setup of an event for user response.

resolveEvent()

GameEventQueue

The GameEventQueue is responsible for managing game event execution and resolution. It is also responsible, at the end of each turn, for deciding which random events occur. It it keeps an array of events, `events`, and keeps track of which event is current with `eventIndex`. The purpose of this class is to abstract some of the logic involved in stepping through (specifically moving forward with) events.

# Events

Events are situations the player responds to. Events (with rare exception) are assumed to have already happened by the time the player sees them.

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

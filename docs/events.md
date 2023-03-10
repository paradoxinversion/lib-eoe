# Events

Events are situations the player responds to. Events (with rare exception) are assumed to have already happened by the time the player sees them.

## GameEvent

All events build off of this one. Supplies some basic properties and methods.

### GameEvent Properties

eventData
eventData is the data ultimately returned back to the game. It contains the `type` of event, the `result`, or resulting data of the event (this will often be what is removed or added to the gamedata, or some piece of information to be shown), and the `updatedGameData`, which can be used to update the state of the game implemenation. `updatedGameData` can pass unmodified data back if no data needs to be modified.

```
{
  type,
  result,
  updatedGameData,
}
```

eventName
This is the name of the event, intended to be shown in the UI.

### GameEvent Methods

executeEvent()
This method is responsible for handling the setup of an event for user response. 

resolveEvent()
In the base method, this method is responsible for returning `eventData`. In sublasses, this method is responsible for taking user input in the form of `resolveArgs` and creating updated `gameData` as necessary before returning `eventData`.

resolveArgs
`resolveArgs` inform the event how it should go about resolving itself. 

resolveArgs.resolutionValue
Resolves to `0` if the event should have a negative resolution (such as denying an applicant to the evil empire), `1` if the event should have a positive resolution (such as accepting an applicant into the evil empire), or greather than/equal to `2` (such as TERMINATING an applicant to the evil empire). The logic in each individual event type (ie, `CombatEvent`) will determine how to handle resolution values.

GameEventQueue
The GameEventQueue is responsible for managing game event execution and resolution. It is also responsible, at the end of each turn, for deciding which random events occur. It it keeps an array of events, `events`, and keeps track of which event is current with `eventIndex`. The purpose of this class is to abstract some of the logic involved in stepping through (specifically moving forward with) events.
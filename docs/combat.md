Combat encounters involves two opposing sides (an attacking force and a defending force). Each person in a combat encounter has an initiative score that determines when they act in combat. This score is partially derived from the person's Combat skill.

When combat begins, each person is assigned an initiative order in a sorted array. This array is looped until all people on one side are dead. During each step of the loop:

1. The current character (the attacker) selects a target
   1. If there is a valid target (ie, another character that is alive), proceed to step 2
   2. If there are no valid targets, the loop ends
2. The attacker deals combat damage to the target
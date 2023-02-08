# Empire of EVIL Library

This repository is a library for the game Empire of EVIL, aiming to serve as a basis for single and multiplayer implementations. The goal of this library is to encapsulate the core mechanics of the game and leave the rest to whatever framework is desired to finish the game itself.



## Notes

- Try to avoid nesting data-- keep things as flat as possible. Approach it as though this data would be used with a database. (ie, prefer structures with fast lookup times wherever possible)
- Underlying game data is not modified by this library. Functions within should return updated objects and fields that can then be used with complete implementations.
import { GameManager } from "../GameManager";

interface GetPeopleParams{
    zoneId?: string;
    nationId?: string;
}

export const getPeople = (gameManager: GameManager, {
    zoneId = null,
    nationId = null,
}: GetPeopleParams) => {
    return Object.values(gameManager.gameData.people)
        .filter(person => {
            if (zoneId && person.homeZoneId !== zoneId){
                return false;
            }

            if (nationId && person.nationId !== nationId){
                return false;
            }

            return true;
        })
}

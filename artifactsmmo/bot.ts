// deno run --allow-net --allow-env --allow-read artifactsmmo/bot.ts
import "jsr:@std/dotenv/load";
import { artifactsHeaders } from "./actions.ts";
import { ARTIFACTS_BASE_URL } from "./constants.ts";
import { ActionQueue, CharacterData } from "./types.ts";
import {
  craftBestHealthPotions,
  craftBestInSlot,
  craftPossibleFood,
  healCharacter,
  trainWeakestCraftingSkill,
} from "./actionFlows.ts";
import { getAllBankItems } from "./items.ts";

export const bankItems = await getAllBankItems();

const runBot = async () => {
  const api_key = Deno.env.get("ARTIFACTS_API_KEY");

  if (!api_key) {
    console.error("API key not found");
    return;
  }

  const characters = await fetch(`${ARTIFACTS_BASE_URL}/my/characters`, {
    headers: artifactsHeaders(),
  }).then(async (res) =>
    res.status === 200
      ? ((await res.json()) as { data: CharacterData[] }).data
      : null
  );
  if (!characters) {
    console.error("Failed to fetch characters");
    return;
  }

  await Promise.all(
    characters.map(async (character) => {
      const actionQueue = [
        () => healCharacter(character, actionQueue),
        () => craftPossibleFood(character, actionQueue),
        () => craftBestHealthPotions(character, actionQueue),
        () => craftBestInSlot(character, actionQueue),
        () => trainWeakestCraftingSkill(character, actionQueue),
      ] as ActionQueue;

      while (actionQueue.length) {
        const action = actionQueue.shift();
        if (action) {
          const result = await action();
          if (!result) {
            return;
          }
        }
      }
    }),
  );
};

runBot();

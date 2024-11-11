// deno run --allow-net --allow-env --allow-read artifactsmmo/bot.ts
import "jsr:@std/dotenv/load";
import {
	artifactsHeaders,
	equip,
	restCharacter,
} from "./actions.ts";
import { ARTIFACTS_BASE_URL } from "./constants.ts";
import { CharacterData } from "./types.ts";
import { craftAndEquipWoodenStaff, fightChickens } from "./actionFlows.ts";

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
			const actionQueue = [] as Array<() => Promise<any>>;

			if (character.hp < character.max_hp) {
				// Heal
				// If we had food or healing spells cast them otherwise just rest

				actionQueue.push(async () => await restCharacter(character));
			}

			if (
				character.inventory.find((item) => item.code === "wooden_staff")
			) {
				actionQueue.push(
					async () => await equip(character, "weapon", "wooden_staff")
				);
			} else if (character.weapon_slot === "wooden_staff") {
				actionQueue.push(...fightChickens(character, actionQueue));
			} else {
				actionQueue.push(
					...craftAndEquipWoodenStaff(character, actionQueue)
				);
			}

			while (actionQueue.length) {
				const action = actionQueue.shift();
				if (action) {
					const result = await action();
					if (!result) {
						return;
					}
				}
			}
		})
	);
};

runBot();
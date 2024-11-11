import { ARTIFACTS_BASE_URL } from "./constants.ts";
import type {
	CharacterData,
	Cooldown,
	GatherDetails,
	Destination,
	DataItem,
	Fight,
} from "./types.ts";
import { sleep } from "./utils.ts";

export const artifactsHeaders = () => {
	const api_key = Deno.env.get("ARTIFACTS_API_KEY");

	return {
		"Content-Type": "application/json",
		Accept: "application/json",
		Authorization: `Bearer ${api_key}`,
	};
};

export async function restCharacter(character: CharacterData) {
	return await fetch(
		`${ARTIFACTS_BASE_URL}/my/${character.name}/action/rest`,
		{
			method: "POST",
			headers: artifactsHeaders(),
		}
	).then(async (res) => {
		if (res.status === 200) {
			const result = (await res.json()) as {
				data: {
					cooldown: Cooldown;
					hp_restored: number;
					character: CharacterData;
				};
			};
			console.log(
				`Healed ${character.name} for ${result.data.hp_restored} HP`
			);
			character = result.data.character;
			await sleep(
				result.data.cooldown.remaining_seconds * 1000,
				result.data.cooldown.reason
			);
			return result;
		} else {
			console.log(
				`Failed to heal ${character.name}`,
				res.status,
				await res.text()
			);
			return null;
		}
	});
}

export async function moveCharacter(
	character: CharacterData,
	pos: { x: number; y: number }
) {
	if (character.x === pos.x && character.y === pos.y) {
		console.log(`${character.name} is already at ${pos.x},${pos.y}`);
		return character;
	}

	return await fetch(
		`${ARTIFACTS_BASE_URL}/my/${character.name}/action/move`,
		{
			method: "POST",
			headers: artifactsHeaders(),
			body: JSON.stringify({ ...pos }),
		}
	).then(async (res) => {
		if (res.status === 200) {
			const result = (await res.json()) as {
				data: {
					destination: Destination;
					cooldown: Cooldown;
					character: CharacterData;
				};
			};
			console.log(`Moved ${character.name} to ${pos.x},${pos.y}`);
			character = result.data.character;
			await sleep(
				result.data.cooldown.remaining_seconds * 1000,
				result.data.cooldown.reason
			);
			return result;
		} else {
			console.log(
				`Failed to move ${character.name}`,
				res.status,
				await res.text()
			);
			return null;
		}
	});
}

export async function gather(character: CharacterData) {
	return await fetch(
		`${ARTIFACTS_BASE_URL}/my/${character.name}/action/gathering`,
		{
			method: "POST",
			headers: artifactsHeaders(),
		}
	).then(async (res) => {
		if (res.status === 200) {
			const result = (await res.json()) as {
				data: {
					details: GatherDetails;
					cooldown: Cooldown;
					character: CharacterData;
				};
			};
			console.log(
				`Gathered ${result.data.details.items.map(
					(item) => `${item.code}: ${item.quantity}`
				)} with ${character.name}`
			);
			character = result.data.character;
			await sleep(
				result.data.cooldown.remaining_seconds * 1000,
				result.data.cooldown.reason
			);
			return result;
		} else {
			console.log(
				`Failed to gather with ${character.name}`,
				res.status,
				await res.text()
			);
			return null;
		}
	});
}

export async function unequip(
	character: CharacterData,
	slot: string,
	quantity: number = 1
) {
	if (!character.weapon_slot) {
		console.log(`${character.name} has no weapon equipped`);
		return character;
	}

	return await fetch(
		`${ARTIFACTS_BASE_URL}/my/${character.name}/action/unequip`,
		{
			method: "POST",
			headers: artifactsHeaders(),
			body: JSON.stringify({ slot, quantity }),
		}
	).then(async (res) => {
		if (res.status === 200) {
			const result = (await res.json()) as {
				data: {
					slot: string;
					item: DataItem;
					cooldown: Cooldown;
					character: CharacterData;
				};
			};
			console.log(`Unequipped ${slot} from ${character.name}`);
			character = result.data.character;
			await sleep(
				result.data.cooldown.remaining_seconds * 1000,
				result.data.cooldown.reason
			);
			return result;
		} else {
			console.log(
				`Failed to unequip ${slot} from ${character.name}`,
				res.status,
				await res.text()
			);
			return null;
		}
	});
}

export async function craft(character: CharacterData, item_code: string) {
	return await fetch(
		`${ARTIFACTS_BASE_URL}/my/${character.name}/action/crafting`,
		{
			method: "POST",
			headers: artifactsHeaders(),
			body: JSON.stringify({ code: item_code }),
		}
	).then(async (res) => {
		if (res.status === 200) {
			const result = (await res.json()) as {
				data: {
					details: GatherDetails;
					cooldown: Cooldown;
					character: CharacterData;
				};
			};
			console.log(`Crafted ${item_code} with ${character.name}`);
			character = result.data.character;
			await sleep(
				result.data.cooldown.remaining_seconds * 1000,
				result.data.cooldown.reason
			);
			return result;
		} else {
			console.log(
				`Failed to craft with ${character.name}`,
				res.status,
				await res.text()
			);
			return null;
		}
	});
}

export async function equip(
	character: CharacterData,
	slot: string,
	item_code: string,
	quantity: number = 1
) {
	return await fetch(
		`${ARTIFACTS_BASE_URL}/my/${character.name}/action/equip`,
		{
			method: "POST",
			headers: artifactsHeaders(),
			body: JSON.stringify({ slot, code: item_code, quantity }),
		}
	).then(async (res) => {
		if (res.status === 200) {
			const result = (await res.json()) as {
				data: {
					slot: string;
					item: DataItem;
					cooldown: Cooldown;
					character: CharacterData;
				};
			};
			console.log(
				`Equipped ${item_code} to ${slot} on ${character.name}`
			);
			character = result.data.character;
			await sleep(
				result.data.cooldown.remaining_seconds * 1000,
				result.data.cooldown.reason
			);
			return result;
		} else {
			console.log(
				`Failed to equip ${item_code} to ${slot} on ${character.name}`,
				res.status,
				await res.text()
			);
			return null;
		}
	});
}

export async function fight(character: CharacterData) {
	return await fetch(
		`${ARTIFACTS_BASE_URL}/my/${character.name}/action/fight`,
		{
			method: "POST",
			headers: artifactsHeaders(),
		}
	).then(async (res) => {
		if (res.status === 200) {
			const result = (await res.json()) as {
				data: {
					fight: Fight;
					cooldown: Cooldown;
					character: CharacterData;
				};
			};
			console.log(
				`Fought with ${character.name}`,
				result.data.fight.logs
			);
			character = result.data.character;
			await sleep(
				result.data.cooldown.remaining_seconds * 1000,
				result.data.cooldown.reason
			);
			return result;
		} else {
			console.log(
				`Failed to fight with ${character.name}`,
				res.status,
				await res.text()
			);
			return null;
		}
	});
}

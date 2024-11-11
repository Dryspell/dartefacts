import {
	craft,
	equip,
	fight,
	gather,
	moveCharacter,
	restCharacter,
	unequip,
} from "./actions.ts";
import { CharacterData } from "./types.ts";

export const craftAndEquipWoodenStaff = (
	character: CharacterData,
	actionQueue: Array<() => Promise<any>>
) => [
	async () =>
		await moveCharacter(character, {
			x: -1,
			y: 0,
		}),
	async () =>
		await gather(character).then((res) => {
			if (!res) return res;
			if (
				(character.inventory.find((item) => item.code === "ash_wood")
					?.quantity ?? 0) < 4
			)
				actionQueue.unshift(async () => await gather(character));
			return res;
		}),
	async () => await unequip(character, "weapon"),
	async () =>
		await moveCharacter(character, {
			x: 2,
			y: 1,
		}),
	async () => await craft(character, "wooden_staff"),
	async () => await equip(character, "weapon", "wooden_staff"),
];

export const fightChickens = (
	character: CharacterData,
	actionQueue: Array<() => Promise<any>>
) => [
	async () =>
		await moveCharacter(character, {
			x: 0,
			y: 1,
		}),
	async () => await fight(character),
	async () => await restCharacter(character),
	async () => {
		actionQueue.unshift(...fightChickens(character, actionQueue));
		return true;
	},
];

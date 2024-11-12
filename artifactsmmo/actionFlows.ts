import {
	craft,
	equip,
	fight,
	gather,
	moveCharacter,
	restCharacter,
	unequip,
} from "./actions.ts";
import { findCraftableFood } from "./items.ts";
import { findClosestContent } from "./maps.ts";
import { ActionQueue, CharacterData } from "./types.ts";

export const craftAndEquipWoodenStaff = (
	character: CharacterData,
	actionQueue: ActionQueue
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
				(character.inventory?.find((item) => item.code === "ash_wood")
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
	actionQueue: ActionQueue
) => [
	async () =>
		await moveCharacter(character, {
			x: 0,
			y: 1,
		}),
	async () => await fight(character),
	async () => await restCharacter(character),
	() => {
		actionQueue.unshift(...fightChickens(character, actionQueue));
		return true;
	},
];

export const craftPossibleFood = (
	character: CharacterData,
	actionQueue: ActionQueue
) => {
	const craftableFood = findCraftableFood(character);

	if (craftableFood) {
		console.log(
			`[${character.name}] is able to craft: ${craftableFood.name}`
		);

		const closetCooking = findClosestContent(
			{
				code: "cooking",
				type: "workshop",
			},
			character
		);
		if (closetCooking) {
			actionQueue.push(
				...[
					async () => await moveCharacter(character, closetCooking),
					async () => await craft(character, craftableFood.code),
					() => craftPossibleFood(character, actionQueue),
				]
			);
		} else {
			console.log(
				`[${character.name}] is unable to find a cooking workshop`
			);
		}
	} else {
		console.log(`[${character.name}] is unable to craft any food`);
	}

	return true;
};

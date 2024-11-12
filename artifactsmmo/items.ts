import items from "./static/items.json" with { type: "json" };
import characters from "./static/characters.json" with { type: "json" };
import { DataItem } from "./types.ts";
import { CharacterData } from "./types.ts";
import {
  findClosestContent,
  findClosestMonsterWithDrop,
  findClosestResource,
} from "./maps.ts";

const equipmentSlots = [
  { slot_key: "weapon_slot", type: "weapon" },
  { slot_key: "shield_slot", type: "shield" },
  { slot_key: "helmet_slot", type: "helmet" },
  { slot_key: "body_armor_slot", type: "body_armor" },
  { slot_key: "leg_armor_slot", type: "leg_armor" },
  { slot_key: "boots_slot", type: "boots" },
  { slot_key: "ring1_slot", type: "ring" },
  { slot_key: "ring2_slot", type: "ring" },
  { slot_key: "amulet_slot", type: "amulet" },
  { slot_key: "artifact1_slot", type: "artifact" },
  { slot_key: "artifact2_slot", type: "artifact" },
  { slot_key: "artifact3_slot", type: "artifact" },
  { slot_key: "utility1_slot", type: "utility" },
  { slot_key: "utility1_slot", type: "utility" },
  { slot_key: "utility1_slot", type: "utility" },
] as const;

const findBestInSlot = (
  slot: typeof equipmentSlots[number],
  character: CharacterData,
) => {
  const slotItems = items.filter((item) =>
    item.level <= character.level && item.type === slot.type &&
    (item.craft?.level ?? 0) <=
      // @ts-expect-error item.craft?.skill_level is a keyof CharacterData
      ((character?.[`${item.craft?.skill}_level`] as number | undefined) ?? 0)
  );
  const bestItem =
    slotItems.sort((a, b) =>
      b.level === a.level
        ? b.effects[0].value - a.effects[0].value
        : b.level - a.level
    )[0];
  return bestItem;
};

const findBestEquipment = (character: CharacterData) =>
  equipmentSlots.map((slot) => ({
    ...slot,
    best: findBestInSlot(slot, character),
  })).filter((equipment) =>
    equipment.best && character[equipment.slot_key] !== equipment.best.code
  ).sort((a, b) => character[a.slot_key] ? 1 : -1)[0];
console.log(
  JSON.stringify(findBestEquipment(characters[0] as CharacterData), null, 2),
);

export const createCraftingPlan = (character: CharacterData) => {
  const bestInSlot = equipmentSlots.map((slot) => ({
    ...slot,
    best: findBestInSlot(slot, character),
  })).filter((equipment) =>
    equipment.best && character[equipment.slot_key] !== equipment.best.code
  ).sort((a, b) => character[a.slot_key] ? 1 : -1)[0];
  if (!bestInSlot) {
    console.log(`[${character.name}] already has best in slot equipment`);
    return null;
  }

  const itemsNeeded = [] as { code: string; quantity: number }[];

  const getAmountInInventory = (code: string) => {
    return character.inventory?.find((item) => item.code === code)?.quantity ??
      0;
  };

  const walkItemRecipeTree = (inputItem: DataItem, quantity = 1) => {
    console.log(
      `[${character.name}] walking tree for ${inputItem.name} x ${quantity}`,
    );
    const amountInInventory = getAmountInInventory(inputItem.code);

    console.log(
      `[${character.name}] Found ${amountInInventory} ${inputItem.name} in inventory, need ${
        quantity - amountInInventory
      } more`,
    );

    if (amountInInventory >= quantity) {
      return;
    }

    const missingIngredients =
      inputItem.craft?.items.filter((i) =>
        getAmountInInventory(i.code) <
          i.quantity * (quantity - amountInInventory)
      ) ?? [];
    if (missingIngredients.length) {
      missingIngredients.forEach((i) => {
        const recipeItem = items.find((item) => item.code === i.code);
        if (recipeItem) {
          walkItemRecipeTree(
            recipeItem,
            i.quantity * (quantity - amountInInventory),
          );
        }
      });
    } else {
      itemsNeeded.push({
        code: inputItem.code,
        quantity: quantity - amountInInventory,
      });
    }
  };

  walkItemRecipeTree(bestInSlot.best);

  const firstItemNeeded = itemsNeeded[0] &&
    items.find((i) => i.code === itemsNeeded[0].code);
  if (firstItemNeeded) {
    console.log(`[${character.name}] needs to craft:`);
    itemsNeeded.forEach((item) => {
      console.log(`[${character.name}] ${item.quantity} x ${item.code}`);
    });

    if (!firstItemNeeded.craft) {
      const closest = firstItemNeeded.subtype === "mob"
        ? findClosestMonsterWithDrop(firstItemNeeded.code, character)
        : findClosestResource(firstItemNeeded.code, character);
      return { bestInSlot, itemsNeeded, closest };
    } else {
      const closest = findClosestContent({
        type: "workshop",
        code: firstItemNeeded.craft.skill,
      }, character);
      return { bestInSlot, itemsNeeded, closest };
    }
  } else {
    return { bestInSlot, itemsNeeded };
  }
};

console.log(createCraftingPlan(characters[0] as CharacterData));

export const findCraftableFood = (character: CharacterData) => {
  const food =
    items.filter((item) =>
      item.type === "consumable" && item.subtype === "food" && item.craft &&
      item.craft.skill === "cooking" &&
      item.craft.level <= character.cooking_level &&
      item.craft.items.every((item) =>
        character.inventory?.find((i) =>
          i.code === item.code && i.quantity >= item.quantity
        )
      )
    ).sort((a, b) => (b.craft?.level ?? 0) - (a.craft?.level ?? 0))[0];

  return food;
};

const healingItems = items.filter((item) =>
  item.type === "consumable" && item.subtype === "food" &&
  item.effects.some((effect) => effect.name === "heal")
);

export const getHealingItemsInInventory = (character: CharacterData) => {
  return healingItems.filter((healingItem) =>
    character.inventory?.find((item) => item.code === healingItem.code)
  ).sort((a, b) => b.effects[0].value - a.effects[0].value);
};

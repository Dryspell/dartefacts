import {
  craft,
  deposit,
  equip,
  fight,
  gather,
  getBankItems,
  getBankItemsAvailable,
  moveCharacter,
  recycle,
  restCharacter,
  unequip,
  use,
  withdraw,
} from "./actions.ts";
import { bankItems } from "./bot.ts";
import { craftingSkills, equipmentSlots } from "./constants.ts";
import {
  createCraftingPlan,
  findBestEquipment,
  findCraftableFood,
  findHighestCraftableItem,
  getHealingItemsInInventory,
} from "./items.ts";
import { findClosestContent, findClosestResource } from "./maps.ts";
import { ActionQueue, CharacterData } from "./types.ts";

export const craftAndEquipWoodenStaff = (
  character: CharacterData,
  actionQueue: ActionQueue,
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
      ) {
        actionQueue.unshift(async () => await gather(character));
      }
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
  actionQueue: ActionQueue,
) => [
  async () =>
    await moveCharacter(character, {
      x: 0,
      y: 1,
    }),
  async () => await fight(character),
  () => healCharacter(character, actionQueue),
  () => {
    actionQueue.unshift(...fightChickens(character, actionQueue));
    return true;
  },
];

export const craftPossibleFood = (
  character: CharacterData,
  actionQueue: ActionQueue,
) => {
  const craftableFood = findCraftableFood(character);

  if (craftableFood) {
    console.log(
      `[${character.name}] is able to craft: ${craftableFood.name}`,
    );

    const closetCooking = findClosestContent(
      {
        code: "cooking",
        type: "workshop",
      },
      character,
    );
    if (closetCooking) {
      actionQueue.unshift(
        async () => await moveCharacter(character, closetCooking),
        async () => await craft(character, craftableFood.code),
        () => craftPossibleFood(character, actionQueue),
      );
    } else {
      console.log(
        `[${character.name}] is unable to find a cooking workshop`,
      );
    }
  } else {
    console.log(`[${character.name}] is unable to craft any food`);
  }

  return true;
};

export const healCharacter = (
  character: CharacterData,
  actionQueue: ActionQueue,
) => {
  if (character.hp < character.max_hp) {
    const healingItemsInInventory = getHealingItemsInInventory(character);
    if (healingItemsInInventory?.length) {
      actionQueue.unshift(
        async () => {
          const healingItem = healingItemsInInventory[0];
          return await use(character, healingItem.code);
        },
        () => healCharacter(character, actionQueue),
      );
    } else {
      actionQueue.unshift(async () => await restCharacter(character));
    }
  }

  return true;
};

export const craftBestInSlot = (
  character: CharacterData,
  actionQueue: ActionQueue,
) => {
  const bestEquipment = findBestEquipment(character);

  const craftingPlan = createCraftingPlan(character, bestEquipment?.best);

  if (!craftingPlan) {
    return true;
  }

  if (
    character.inventory?.find((i) => i.code === craftingPlan.itemToCraft.code)
  ) {
    actionQueue.unshift(
      async () => await unequip(character, bestEquipment.slot_key),
      async () =>
        await equip(
          character,
          bestEquipment.slot_key.split("_")[0],
          bestEquipment.best.code,
        ),
      async () => await craftBestInSlot(character, actionQueue),
    );
    return true;
  }

  return craftingFlow(
    character,
    bestEquipment.best,
    actionQueue,
    craftBestInSlot,
  );
};

export const trainWeakestCraftingSkill = async (
  character: CharacterData,
  actionQueue: ActionQueue,
) => {
  const weakestSkill = craftingSkills.reduce((acc, skill) => {
    return character?.[`${skill}_level`] < acc.level
      ? { skill, level: character?.[`${skill}_level`] }
      : acc;
  }, {
    skill: craftingSkills[0] as typeof craftingSkills[number],
    level: (character?.[`${craftingSkills[0]}_level`] ?? 100),
  });

  if (!weakestSkill) {
    return true;
  }

  const highestCraftableItem = findHighestCraftableItem(
    character,
    weakestSkill,
  );

  const craftableItemInInventory = character.inventory &&
    character.inventory.find((i) => i.code === highestCraftableItem?.code);

  if (
    craftableItemInInventory &&
    !["utility", "consumable", "resource"].includes(
      highestCraftableItem.type,
    ) &&
    highestCraftableItem.craft?.skill
  ) {
    actionQueue.unshift(
      () =>
        moveCharacter(
          character,
          findClosestContent({
            code: highestCraftableItem.craft.skill,
            type: "workshop",
          }, character),
        ),
      async () =>
        await recycle(character, {
          item_code: highestCraftableItem.code,
          quantity: character.inventory?.find((i) =>
            i.code === highestCraftableItem?.code
          )?.quantity ?? 1,
        }),
      async () => await trainWeakestCraftingSkill(character, actionQueue),
    );
    return true;
  } else if (craftableItemInInventory && highestCraftableItem.craft) {
    console.log(
      `[${character.name}] already has ${highestCraftableItem?.name} in inventory, depositing`,
    );
    actionQueue.unshift(
      async () => await moveCharacter(character, { x: 4, y: 1 }),
      async () =>
        await deposit(character, {
          item_code: craftableItemInInventory.code,
          quantity: craftableItemInInventory.quantity,
        }),
      async () => await trainWeakestCraftingSkill(character, actionQueue),
    );
    return true;
  }

  if (
    highestCraftableItem.type === "resource" &&
    highestCraftableItem.subtype === weakestSkill.skill
  ) {
    console.log(
      `[${character.name}] is training ${weakestSkill.skill} by gathering ${highestCraftableItem?.name}`,
    );
    const closest = findClosestResource(highestCraftableItem.code, character);
    actionQueue.unshift(
      async () => await moveCharacter(character, closest),
      async () => await gather(character),
      async () => await trainWeakestCraftingSkill(character, actionQueue),
    );
    return true;
  }

  console.log(
    `[${character.name}] is training ${weakestSkill.skill} by crafting ${highestCraftableItem?.name}`,
  );

  return craftingFlow(
    character,
    highestCraftableItem,
    actionQueue,
    trainWeakestCraftingSkill,
  );
};

async function craftingFlow(
  character: CharacterData,
  itemToCraft: ReturnType<typeof findHighestCraftableItem>,
  actionQueue: ActionQueue,
  flowToResume: (
    character: CharacterData,
    actionQueue: ActionQueue,
  ) => boolean | Promise<boolean> | undefined,
) {
  const craftingPlan = createCraftingPlan(character, itemToCraft);

  if (!craftingPlan) {
    return true;
  }

  if (
    character.inventory &&
    ((character.inventory.reduce((acc, item) => acc + item.quantity, 0) ??
      0) >=
      character.inventory_max_items)
  ) {
    console.log(`[${character.name}] inventory is full`);
    actionQueue.unshift(
      async () => await moveCharacter(character, { x: 4, y: 1 }),
      ...character.inventory.filter((i) =>
        !craftingPlan.itemsNeeded.some((itemNeeded) =>
          itemNeeded.code === i.code
        )
      ).map((i) => async () =>
        await deposit(character, { item_code: i.code, quantity: i.quantity })
      ),
      async () => await flowToResume(character, actionQueue),
    );
    return true;
  }

  // // check if bank has the items needed
  const bankItemsNeeded = getBankItemsAvailable(craftingPlan.itemsNeeded);
  if (bankItems && bankItemsNeeded.length) {
    console.log(
      `[${character.name}] bank has the items needed: ${
        bankItemsNeeded.map((bi) => `${bi.quantity} x ${bi.code}`).join(", ")
      }`,
    );
    bankItemsNeeded.forEach((bi) => {
      const claimed = bankItems?.claimed.find((c) => c.code === bi.code);
      if (claimed) {
        claimed.quantity -= bi.quantity;
        console.log(
          `[${character.name}] is claiming ${bi.quantity} x ${bi.code} from the bank, bank has ${
            (bankItems?.bank.find((bib) => bib.code === bi.code)?.quantity ??
              0) - claimed.quantity
          } x ${bi.code} left`,
        );
        if (claimed.quantity <= 0 && bankItems) {
          bankItems.claimed = bankItems?.claimed.filter((c) =>
            c.code !== bi.code
          );
        }
      } else {
        bankItems?.claimed.push(bi);
      }
    });

    actionQueue.unshift(
      async () => await moveCharacter(character, { x: 4, y: 1 }),
      ...bankItemsNeeded.map((bi) => async () =>
        await withdraw(character, {
          item_code: bi.code,
          quantity: bi.quantity,
        })
      ),
      async () => await flowToResume(character, actionQueue),
    );
    return true;
  }

  const closest = craftingPlan.closest;
  if (!closest) {
    console.log(`[${character.name}] is unable to find a workshop`);
    return true;
  }

  if (!closest.content) {
    console.log(`[${character.name}] failed to find content`);
    return true;
  }

  actionQueue.unshift(
    async () => await moveCharacter(character, closest),
    closest.content.type === "workshop"
      ? async () => await craft(character, craftingPlan.itemsNeeded[0].code)
      : closest.content.type === "resource"
      ? async () => await gather(character)
      : closest.content.type === "monster"
      ? async () =>
        await fight(character).then((res) => {
          healCharacter(character, actionQueue);
          return res;
        })
      : async () => await restCharacter(character),
    async () => await flowToResume(character, actionQueue),
  );
  return true;
}

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
  getBestCraftableHealingPotions,
  getFoodItemsInInventory,
  itemsInInventoryCount,
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
    const healingItemsInInventory = getFoodItemsInInventory(character);
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

const MAX_HEALING_POTIONS = 100;
export const craftBestHealthPotions = (
  character: CharacterData,
  actionQueue: ActionQueue,
) => {
  if (character.level < 5) {
    return true;
  }
  if (character.alchemy_level < 5) {
    trainSkill(character, actionQueue, {
      skill: "alchemy",
      level: character.alchemy_level,
    }, craftBestHealthPotions);
    return true;
  }

  const bestHealthPotion = getBestCraftableHealingPotions(character);

  if (!bestHealthPotion) {
    console.log(`[${character.name}] is unable to craft any health potions`);
    return true;
  }

  const equippedHealthPotionsCount =
    character.utility1_slot === bestHealthPotion.code
      ? character.utility1_slot_quantity
      : 0;

  if (equippedHealthPotionsCount < MAX_HEALING_POTIONS) {
    const potionsInInventory = character.inventory?.find((i) =>
      i.code === bestHealthPotion.code
    );

    console.log(
      `[${character.name}] has ${equippedHealthPotionsCount} health potions equipped, ${
        potionsInInventory?.quantity ?? 0
      } in inventory`,
    );

    if (potionsInInventory) {
      actionQueue.unshift(
        async () =>
          await equip(
            character,
            "utility1",
            bestHealthPotion.code,
            Math.min(
              MAX_HEALING_POTIONS - equippedHealthPotionsCount,
              potionsInInventory.quantity,
            ),
          ),
        () => craftBestHealthPotions(character, actionQueue),
      );
      return true;
    }

    return craftingFlow(
      character,
      bestHealthPotion,
      actionQueue,
      craftBestHealthPotions,
      Math.min(MAX_HEALING_POTIONS - equippedHealthPotionsCount, 25),
    );
  }

  console.log(`[${character.name}] has enough health potions`);

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
      async () => await unequip(character, bestEquipment.slot_key.replace("_slot", "")),
      async () =>
        await equip(
          character,
          bestEquipment.slot_key.replace("_slot", ""),
          bestEquipment.best.code,
        ),
      () => craftBestInSlot(character, actionQueue),
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

export const trainWeakestCraftingSkill = (
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

  trainSkill(character, actionQueue, weakestSkill, trainWeakestCraftingSkill);
  return true;
};

function trainSkill(
  character: CharacterData,
  actionQueue: ActionQueue,
  skillToTrain: { skill: (typeof craftingSkills)[number]; level: number },
  flowToResume: (
    character: CharacterData,
    actionQueue: ActionQueue,
  ) => boolean | Promise<boolean> | undefined,
) {
  const highestCraftableItem = findHighestCraftableItem(
    character,
    skillToTrain,
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
      async () => await flowToResume(character, actionQueue),
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
      async () => await flowToResume(character, actionQueue),
    );
    return true;
  }

  if (
    highestCraftableItem.type === "resource" &&
    highestCraftableItem.subtype === skillToTrain.skill
  ) {
    console.log(
      `[${character.name}] is training ${skillToTrain.skill} by gathering ${highestCraftableItem?.name}`,
    );

    const closest = findClosestResource(highestCraftableItem.code, character);
    actionQueue.unshift(
      () =>
        depositUnneededItems(
          character,
          actionQueue,
          [{
            code: highestCraftableItem.code,
            quantity: 1,
          }],
          () => true,
        ),
      async () => await moveCharacter(character, closest),
      ...Array.from({
        length: Math.min(
          itemsInInventoryCount(character).remaining,
          25,
        ),
      }, (_) => async () => await gather(character)),
      async () => await flowToResume(character, actionQueue),
    );
    return true;
  }

  console.log(
    `[${character.name}] is training ${skillToTrain.skill} by crafting ${highestCraftableItem?.name}`,
  );

  return craftingFlow(
    character,
    highestCraftableItem,
    actionQueue,
    flowToResume,
  );
}

function craftingFlow(
  character: CharacterData,
  itemToCraft: ReturnType<typeof findHighestCraftableItem>,
  actionQueue: ActionQueue,
  flowToResume: (
    character: CharacterData,
    actionQueue: ActionQueue,
  ) => boolean | Promise<boolean> | undefined,
  quantity = 1,
) {
  const craftingPlan = createCraftingPlan(character, itemToCraft, quantity);

  if (!craftingPlan) {
    return true;
  }

  // check if bank has the items needed
  const bankItemsNeeded = getBankItemsAvailable(craftingPlan.itemsNeeded)
    .filter((bi) => bi.code !== craftingPlan.itemToCraft.code);
  if (bankItems && bankItemsNeeded.length) {
    console.log(
      `[${character.name}] bank has the items needed: ${
        bankItemsNeeded.map((bi) => `${bi.quantity} x ${bi.code}`).join(", ")
      }`,
    );
    bankItemsNeeded.forEach((bi) => {
      const claimed = bankItems?.claimed.find((c) => c.code === bi.code);
      console.log(
        `[${character.name}] is claiming ${bi.quantity} x ${bi.code} from the bank, bank has ${
          (bankItems?.bank.find((bib) => bib.code === bi.code)?.quantity ??
            0) - (claimed?.quantity ?? 0)
        } x ${bi.code} left`,
      );

      if (claimed) {
        claimed.quantity -= bi.quantity;
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
      () =>
        depositUnneededItems(
          character,
          actionQueue,
          craftingPlan.itemsNeeded,
          () => true,
        ),
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
    () =>
      depositUnneededItems(
        character,
        actionQueue,
        craftingPlan.itemsNeeded,
        () => true,
      ),
    async () => await moveCharacter(character, closest),
    ...(closest.content.type === "workshop"
      ? Array.from(
        { length: quantity },
        (_) => async () =>
          await craft(character, craftingPlan.itemsNeeded[0].code),
      )
      : closest.content.type === "resource"
      ? Array.from({
        length: Math.min(
          itemsInInventoryCount(character).remaining,
          craftingPlan.itemsNeeded[0].quantity,
        ),
      }, (_) => async () => await gather(character))
      : closest.content.type === "monster"
      ? [
        async () => await fight(character),
        () => healCharacter(character, actionQueue),
        () => craftBestHealthPotions(character, actionQueue),
      ]
      : [async () => await restCharacter(character)]),
    async () => await flowToResume(character, actionQueue),
  );
  return true;
}

function depositUnneededItems(
  character: CharacterData,
  actionQueue: ActionQueue,
  itemsNeeded: {
    code: string;
    quantity: number;
  }[],
  flowToResume: (
    character: CharacterData,
    actionQueue: ActionQueue,
  ) => boolean | Promise<boolean> | undefined,
) {
  if (
    character?.inventory && itemsInInventoryCount(character).amt >=
      character.inventory_max_items
  ) {
    console.log(`[${character.name}] inventory is full`);
    actionQueue.unshift(
      async () => await moveCharacter(character, { x: 4, y: 1 }),
      ...character.inventory.filter((i) =>
        !itemsNeeded.some((itemNeeded) => itemNeeded.code === i.code)
      ).filter((i) => i?.code).map((i) => async () =>
        await deposit(character, { item_code: i.code, quantity: i.quantity })
      ),
      async () => await flowToResume(character, actionQueue),
    );
    return true;
  }
  return true;
}

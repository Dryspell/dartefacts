import { ARTIFACTS_BASE_URL } from "./constants.ts";
import type {
  CharacterData,
  Cooldown,
  DataItem,
  Destination,
  GatherDetails,
  ItemElement,
} from "./types.ts";
import { sleep } from "./utils.ts";
import createClient from "openapi-fetch";
import type { paths } from "./api.ts";
import { bankItems } from "./bot.ts";

export const client = createClient<paths>({ baseUrl: ARTIFACTS_BASE_URL });

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
    },
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
        `[${character.name}] Healed for ${result.data.hp_restored} HP`,
      );

      Object.assign(character, result.data.character);
      await sleep(
        result.data.cooldown.remaining_seconds * 1000,
        result.data.cooldown.reason,
        character.name,
      );
      return result;
    } else {
      console.log(
        `[${character.name}] Failed to heal`,
        res.status,
        await res.text(),
      );
      return null;
    }
  });
}

export async function moveCharacter(
  character: CharacterData,
  pos: { x: number; y: number },
) {
  if (character.x === pos.x && character.y === pos.y) {
    // console.log(`${character.name} is already at ${pos.x},${pos.y}`);
    return character;
  }

  return await fetch(
    `${ARTIFACTS_BASE_URL}/my/${character.name}/action/move`,
    {
      method: "POST",
      headers: artifactsHeaders(),
      body: JSON.stringify({ ...pos }),
    },
  ).then(async (res) => {
    if (res.status === 200) {
      const result = (await res.json()) as {
        data: {
          destination: Destination;
          cooldown: Cooldown;
          character: CharacterData;
        };
      };
      console.log(`[${character.name}] Moved to ${pos.x},${pos.y}`);

      Object.assign(character, result.data.character);
      await sleep(
        result.data.cooldown.remaining_seconds * 1000,
        result.data.cooldown.reason,
        character.name,
      );
      return result;
    } else {
      console.log(
        `[${character.name}] Failed to move to ${pos.x},${pos.y}`,
        res.status,
        await res.text(),
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
    },
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
        `[${character.name}] Gathered ${
          result.data.details.items.map(
            (item) => `${item.code}: ${item.quantity}`,
          )
        }`,
      );

      Object.assign(character, result.data.character);
      await sleep(
        result.data.cooldown.remaining_seconds * 1000,
        result.data.cooldown.reason,
        character.name,
      );
      return result;
    } else {
      console.log(
        `[${character.name}] Failed to gather`,
        res.status,
        await res.text(),
      );
      return null;
    }
  });
}

export async function unequip(
  character: CharacterData,
  slot: string,
  quantity: number = 1,
) {
  //@ts-expect-error slot is a string
  if (!(character?.[`${slot}_slot`] as string | undefined)) {
    console.log(`[${character.name}] no ${slot} equipped`);
    return character;
  }

  return await fetch(
    `${ARTIFACTS_BASE_URL}/my/${character.name}/action/unequip`,
    {
      method: "POST",
      headers: artifactsHeaders(),
      body: JSON.stringify({ slot, quantity }),
    },
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
      console.log(`[${character.name}] Unequipped ${slot}`);

      Object.assign(character, result.data.character);
      await sleep(
        result.data.cooldown.remaining_seconds * 1000,
        result.data.cooldown.reason,
        character.name,
      );
      return result;
    } else {
      console.log(
        `Failed to unequip ${slot} from ${character.name}`,
        res.status,
        await res.text(),
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
    },
  ).then(async (res) => {
    if (res.status === 200) {
      const result = (await res.json()) as {
        data: {
          details: GatherDetails;
          cooldown: Cooldown;
          character: CharacterData;
        };
      };
      console.log(`[${character.name}] Crafted ${item_code}`);

      Object.assign(character, result.data.character);
      await sleep(
        result.data.cooldown.remaining_seconds * 1000,
        result.data.cooldown.reason,
        character.name,
      );
      return result;
    } else {
      console.log(
        `[${character.name}] Failed to craft ${item_code}`,
        res.status,
        await res.text(),
      );
      return true;
    }
  });
}

export async function equip(
  character: CharacterData,
  slot: string,
  item_code: string,
  quantity: number = 1,
) {
  return await fetch(
    `${ARTIFACTS_BASE_URL}/my/${character.name}/action/equip`,
    {
      method: "POST",
      headers: artifactsHeaders(),
      body: JSON.stringify({ slot, code: item_code, quantity }),
    },
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
      console.log(`[${character.name}] Equipped ${item_code} to ${slot}`);

      Object.assign(character, result.data.character);
      await sleep(
        result.data.cooldown.remaining_seconds * 1000,
        result.data.cooldown.reason,
        character.name,
      );
      return result;
    } else {
      console.log(
        `[${character.name}] Failed to equip ${item_code} to ${slot}`,
        res.status,
        await res.text(),
      );
      return null;
    }
  });
}

export async function fight(character: CharacterData) {
  const { data, error } = await client.POST("/my/{name}/action/fight", {
    params: { path: { name: character.name } },
    headers: artifactsHeaders(),
  });

  if (error || !data) {
    console.log(`Failed to fight with ${character.name}`, error);
    return null;
  }

  console.log(`Fought with ${character.name}`, data.data.fight.logs);

  Object.assign(character, data.data.character);
  await sleep(
    data.data.cooldown.remaining_seconds * 1000,
    data.data.cooldown.reason,
    character.name,
  );
  return data.data;
}

export async function use(character: CharacterData, item_code: string) {
  const { data, error } = await client.POST("/my/{name}/action/use", {
    params: { path: { name: character.name } },
    headers: artifactsHeaders(),
    body: { code: item_code, quantity: 1 },
  });

  if (error || !data) {
    console.log(`[${character.name}] Failed to use ${item_code}`, error);
    return null;
  }

  console.log(`[${character.name}] Used ${item_code}`);

  Object.assign(character, data.data.character);
  await sleep(
    data.data.cooldown.remaining_seconds * 1000,
    data.data.cooldown.reason,
    character.name,
  );
  return data.data;
}

export async function deposit(
  character: CharacterData,
  { item_code, quantity }: { item_code: string; quantity: number },
) {
  const { data, error } = await client.POST("/my/{name}/action/bank/deposit", {
    params: { path: { name: character.name } },
    body: { code: item_code, quantity },
    headers: artifactsHeaders(),
  });

  if (error || !data) {
    console.log(
      `[${character.name}] Failed to deposit ${quantity} x ${item_code}`,
      error,
    );
    return null;
  }

  console.log(
    `[${character.name}] Deposited to bank ${quantity} x ${item_code}`,
  );

  Object.assign(character, data.data.character);
  bankItems?.bank && Object.assign(bankItems.bank, data.data.bank);

  await sleep(
    data.data.cooldown.remaining_seconds * 1000,
    data.data.cooldown.reason,
    character.name,
  );
  return data.data;
}

export async function withdraw(
  character: CharacterData,
  { item_code, quantity }: { item_code: string; quantity: number },
) {
  if (quantity <= 0) quantity = 1;
  const { data, error } = await client.POST("/my/{name}/action/bank/withdraw", {
    params: { path: { name: character.name } },
    body: { code: item_code, quantity: quantity || 1 },
    headers: artifactsHeaders(),
  });

  if (error || !data) {
    console.log(
      `[${character.name}] Failed to withdraw ${quantity} x ${item_code}`,
      error,
    );
    return null;
  }

  console.log(
    `[${character.name}] Withdrew from bank ${quantity} x ${item_code}`,
  );

  Object.assign(character, data.data.character);
  bankItems?.bank && Object.assign(bankItems.bank, data.data.bank);

  await sleep(
    data.data.cooldown.remaining_seconds * 1000,
    data.data.cooldown.reason,
    character.name,
  );
  return data.data;
}

export async function recycle(
  character: CharacterData,
  { item_code, quantity }: { item_code: string; quantity: number },
) {
  const { data, error } = await client.POST("/my/{name}/action/recycling", {
    params: { path: { name: character.name } },
    body: { code: item_code, quantity },
    headers: artifactsHeaders(),
  });

  if (error || !data) {
    console.log(
      `[${character.name}] Failed to recycle ${quantity} x ${item_code}`,
      error,
    );
    return null;
  }

  console.log(`[${character.name}] Recycled ${quantity} x ${item_code}`);

  Object.assign(character, data.data.character);
  await sleep(
    data.data.cooldown.remaining_seconds * 1000,
    data.data.cooldown.reason,
    character.name,
  );
  return data.data;
}

export async function getBankItems(
  character: CharacterData,
  { item_code }: { item_code: string },
) {
  const { data, error } = await client.GET("/my/bank/items", {
    params: { query: { item_code } },
    headers: artifactsHeaders(),
  });

  if (error || !data) {
    console.log(`[${character.name}] Failed to get bank items`, error);
    return null;
  }

  console.log(`[${character.name}] Got bank items`);

  return data.data;
}

export const getBankItemsAvailable = (itemsNeeded: ItemElement[]) => {
  if (!bankItems) return [];

  const claimed = bankItems.claimed.filter((i) =>
    itemsNeeded.some((itemNeeded) => itemNeeded.code === i.code)
  );

  const available = bankItems.bank.filter((i) =>
    itemsNeeded.some((itemNeeded) => itemNeeded.code === i.code)
  ).map((i) => ({
    ...i,
    quantity: Math.min(
      itemsNeeded.find((itn) => itn.code === i.code)?.quantity ?? 0,
      i.quantity -
        (claimed.find((c) => c.code === i.code)?.quantity ?? 0),
    ),
  })).filter((i) => i.quantity > 0);

  return available;
};

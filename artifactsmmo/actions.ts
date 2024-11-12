import { ARTIFACTS_BASE_URL } from "./constants.ts";
import type {
  CharacterData,
  Cooldown,
  DataItem,
  Destination,
  GatherDetails,
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
      );
      return result;
    } else {
      console.log(
        `[${character.name}] Failed to craft`,
        res.status,
        await res.text(),
      );
      return null;
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

// export async function fight(character: CharacterData) {
// 	return await fetch(
// 		`${ARTIFACTS_BASE_URL}/my/${character.name}/action/fight`,
// 		{
// 			method: "POST",
// 			headers: artifactsHeaders(),
// 		}
// 	).then(async (res) => {
// 		if (res.status === 200) {
// 			const result = (await res.json()) as {
// 				data: {
// 					fight: Fight;
// 					cooldown: Cooldown;
// 					character: CharacterData;
// 				};
// 			};
// 			console.log(
// 				`Fought with ${character.name}`,
// 				result.data.fight.logs
// 			);
// 			character = result.data.character;
// 			await sleep(
// 				result.data.cooldown.remaining_seconds * 1000,
// 				result.data.cooldown.reason
// 			);
// 			return result;
// 		} else {
// 			console.log(
// 				`Failed to fight with ${character.name}`,
// 				res.status,
// 				await res.text()
// 			);
// 			return null;
// 		}
// 	});
// }

import createClient from "openapi-fetch";
import type { paths } from "./api.ts";
const client = createClient<paths>({ baseUrl: ARTIFACTS_BASE_URL });

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
    console.log(`Failed to use ${item_code} with ${character.name}`, error);
    return null;
  }

  console.log(`Used ${item_code} with ${character.name}`);

  Object.assign(character, data.data.character);
  await sleep(
    data.data.cooldown.remaining_seconds * 1000,
    data.data.cooldown.reason,
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
    console.log(`Failed to deposit with ${character.name}`, error);
    return null;
  }

  console.log(`Deposited with ${character.name}`);

  Object.assign(character, data.data.character);
  await sleep(
    data.data.cooldown.remaining_seconds * 1000,
    data.data.cooldown.reason,
  );
  return data.data;
}

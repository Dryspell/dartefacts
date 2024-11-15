// deno run --allow-net --allow-read --allow-write --allow-env artifactsmmo/static/fetchStaticData.ts
import "jsr:@std/dotenv/load";
import { artifactsHeaders } from "../actions.ts";
import { ARTIFACTS_BASE_URL } from "../constants.ts";
import { DataItem, Destination, MonsterData, ResourceData } from "../types.ts";
const encoder = new TextEncoder();

const fetchItems = async () => {
  const items: DataItem[] = [];
  let page: number = 1;
  const size: number = 100;
  let pages = 2;

  while (page < pages) {
    await fetch(`${ARTIFACTS_BASE_URL}/items?page=${page}&size=${size}`)
      .then((res) => res.json())
      .then(
        (res: {
          data: DataItem[];
          total: number;
          page: number;
          size: number;
          pages: number;
        }) => {
          items.push(...res.data);
          page = res.page + 1;
          pages = res.pages;
        },
      );
  }

  await Deno.writeFile(
    "./artifactsmmo/static/items.json",
    encoder.encode(JSON.stringify(items, null, 2)),
  );
};

// fetchItems();

const fetchMaps = async () => {
  const maps: Destination[] = [];
  let page: number = 1;
  const size: number = 100;
  let pages = 2;

  while (page < pages) {
    await fetch(`${ARTIFACTS_BASE_URL}/maps?page=${page}&size=${size}`)
      .then((res) => res.json())
      .then(
        (res: {
          data: Destination[];
          total: number;
          page: number;
          size: number;
          pages: number;
        }) => {
          maps.push(...res.data);
          page = res.page + 1;
          pages = res.pages;
        },
      );
  }

  await Deno.writeFile(
    "./artifactsmmo/static/maps.json",
    encoder.encode(JSON.stringify(maps, null, 2)),
  );
};
// fetchMaps();

const fetchMonsters = async () => {
  const monsters: MonsterData[] = [];
  let page: number = 1;
  const size: number = 100;
  let pages = 2;

  while (page < pages) {
    await fetch(`${ARTIFACTS_BASE_URL}/monsters?page=${page}&size=${size}`)
      .then((res) => res.json())
      .then(
        (res: {
          data: MonsterData[];
          total: number;
          page: number;
          size: number;
          pages: number;
        }) => {
          monsters.push(...res.data);
          page = res.page + 1;
          pages = res.pages;
        },
      );
  }

  await Deno.writeFile(
    "./artifactsmmo/static/monsters.json",
    encoder.encode(JSON.stringify(monsters, null, 2)),
  );
};
// fetchMonsters();

const fetchCharacters = async () => {
  const api_key = Deno.env.get("ARTIFACTS_API_KEY");

  if (!api_key) {
    console.error("API key not found");
    return;
  }

  const characters = await fetch(`${ARTIFACTS_BASE_URL}/my/characters`, {
    headers: artifactsHeaders(),
  })
    .then((res) => res.json())
    .then((res) => res.data);

  await Deno.writeFile(
    "./artifactsmmo/static/characters.json",
    encoder.encode(JSON.stringify(characters, null, 2)),
  );
};
// fetchCharacters();

const fetchResources = async () => {
  const resources: ResourceData[] = [];
  let page: number = 1;
  const size: number = 100;
  let pages = 2;

  while (page < pages) {
    await fetch(`${ARTIFACTS_BASE_URL}/resources?page=${page}&size=${size}`)
      .then((res) => res.json())
      .then(
        (res: {
          data: ResourceData[];
          total: number;
          page: number;
          size: number;
          pages: number;
        }) => {
          resources.push(...res.data);
          page = res.page + 1;
          pages = res.pages;
        },
      );
  }

  await Deno.writeFile(
    "./artifactsmmo/static/resources.json",
    encoder.encode(JSON.stringify(resources, null, 2)),
  );
};
// fetchResources();
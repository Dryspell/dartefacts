import maps from "./static/maps.json" with { type: "json" };
import resources from "./static/resources.json" with { type: "json" };
import monsters from "./static/monsters.json" with { type: "json" };
import { CharacterData, Content } from "./types.ts";

type _hasPos = { x: number; y: number };

const computeDistance = <Ta extends _hasPos, Tb extends _hasPos>(
  a: Ta,
  b: Tb,
) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export const findClosestContent = (
  content: Content,
  character: CharacterData,
) => {
  const closest =
    maps.filter((map) =>
      map.content?.code === content.code && map.content?.type === content.type
    ).sort((a, b) =>
      computeDistance(a, character) - computeDistance(b, character)
    )[0];
  return closest;
};

export const findClosestResource = (
  resource: string,
  character: CharacterData,
) => {
  const r = resources.filter((re) => re.drops.some((d) => d.code === resource));

  const closest =
    maps.filter((map) => r.some((re) => re.code === map.content?.code)).sort((
      a,
      b,
    ) => computeDistance(a, character) - computeDistance(b, character))[0];
  return closest;
};

export const findClosestMonsterWithDrop = (
  itemCode: string,
  character: CharacterData,
) => {
  const m = monsters.filter((monster) =>
    monster.drops.some((drop) => drop.code === itemCode)
  );

  const closest =
    maps.filter((map) =>
      m.some((mo) => mo.code === map.content?.code) &&
      map.content?.type === "monster"
    ).sort((a, b) =>
      computeDistance(a, character) - computeDistance(b, character)
    )[0];
  return closest;
};

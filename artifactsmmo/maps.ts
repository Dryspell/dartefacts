import maps from "./maps.json" with { type: "json" };
import { CharacterData, Content } from "./types.ts";

type _hasPos = { x: number; y: number };

const computeDistance = <Ta extends _hasPos, Tb extends _hasPos>(a:Ta, b:Tb) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export const findClosestContent = (content: Content, character: CharacterData) => {
  const closest = maps.filter(map => map.content?.code === content.code && map.content?.type === content.type).sort((a,b) => computeDistance(a, character) - computeDistance(b, character))[0];
	return closest;
};

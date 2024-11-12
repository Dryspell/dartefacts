import items from "./items.json" with { type: "json" };
import { CharacterData } from "./types.ts";

const equipmentSlots = [	{slot_key:"weapon_slot", type: "weapon"},
	{slot_key:"shield_slot", type: "shield"},
	{slot_key:"helmet_slot", type: "helmet"},
	{slot_key:"body_armor_slot", type: "body_armor"},
	{slot_key:"leg_armor_slot", type: "leg_armor"},
	{slot_key:"boots_slot", type: "boots"},
	{slot_key:"ring1_slot", type: "ring"},
	{slot_key:"ring2_slot", type: "ring"},
	{slot_key:"amulet_slot", type: "amulet"},
	{slot_key:"artifact1_slot", type: "artifact"},
	{slot_key:"artifact2_slot", type: "artifact"},
	{slot_key:"artifact3_slot", type: "artifact"},
	{slot_key:"utility1_slot", type: "utility"},
	{slot_key:"utility1_slot", type: "utility"},
	{slot_key:"utility1_slot", type: "utility"},
]

const findBestInSlot = (slot: typeof equipmentSlots[number], level: number) => {
  const slotItems = items.filter(item => item.level <= level && item.type === slot.type);
  const bestItem = slotItems.sort((a,b) => b.level === a.level ? b.effects[0].value - a.effects[0].value : b.level - a.level)[0];
  return bestItem;
}

const bestEquipment = equipmentSlots.map(slot => ({...slot, best: findBestInSlot(slot, 3)})).filter(equipment => Boolean(equipment.best));
console.log(JSON.stringify(bestEquipment, null, 2));

export const findCraftableFood = (character: CharacterData) => {
  const food = items.filter(item => item.type === "food" && item.craft && item.craft.skill === "cooking" && item.craft.items.every(item => character.inventory?.find(i => i.code === item.code && i.quantity >= item.quantity))).sort((a,b) => b.level - a.level)[0];

  return food;
}

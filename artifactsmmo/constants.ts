export const ARTIFACTS_BASE_URL = "https://api.artifactsmmo.com";

export const equipmentSlots = [
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

export const craftingSkills = [
  "weaponcrafting",
  "gearcrafting",
  "jewelrycrafting",
  "alchemy",
  "woodcutting",
  "mining",
] as const;

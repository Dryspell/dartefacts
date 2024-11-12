import { components } from "./api.ts";

export type ActionQueue = Array<() => Promise<unknown> | unknown>;

export type CharacterData = components["schemas"]["CharacterSchema"];

export type Inventory = {
	slot: number;
	code: string;
	quantity: number;
};

export type Cooldown = {
	total_seconds: number;
	remaining_seconds: number;
	started_at: Date;
	expiration: Date;
	reason: string;
};

export type Destination = {
	name: string;
	skin: string;
	x: number;
	y: number;
	content: Content;
};

export type Content = {
	type: string;
	code: string;
};

export type GatherDetails = {
	xp: number;
	items: Item[];
};

export type Item = {
	code: string;
	quantity: number;
};

export type DataItem = {
	name: string;
	code: string;
	level: number;
	type: string;
	subtype: string;
	description: string;
	effects: Effect[];
	craft: Craft;
	tradeable: boolean;
};

export type Craft = {
	skill: string;
	level: number;
	items: ItemElement[];
	quantity: number;
} | null;

export type ItemElement = {
	code: string;
	quantity: number;
};

export type Effect = {
	name: string;
	value: number;
};

export type Fight = {
	xp: number;
	gold: number;
	drops: Drop[];
	turns: number;
	monster_blocked_hits: ErBlockedHits;
	player_blocked_hits: ErBlockedHits;
	logs: string[];
	result: string;
};

export type Drop = {
	code: string;
	quantity: number;
};

export type ErBlockedHits = {
	fire: number;
	earth: number;
	water: number;
	air: number;
	total: number;
};

export type MonsterData = {
	name: string;
	code: string;
	level: number;
	hp: number;
	attack_fire: number;
	attack_earth: number;
	attack_water: number;
	attack_air: number;
	res_fire: number;
	res_earth: number;
	res_water: number;
	res_air: number;
	min_gold: number;
	max_gold: number;
	drops: Drop[];
};

export type ResourceData = {
    name:  string;
    code:  string;
    skill: string;
    level: number;
    drops: Drop[];
}
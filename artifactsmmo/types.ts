export type CharacterData = {
	name: string;
	account: string;
	skin: string;
	level: number;
	xp: number;
	max_xp: number;
	gold: number;
	speed: number;
	mining_level: number;
	mining_xp: number;
	mining_max_xp: number;
	woodcutting_level: number;
	woodcutting_xp: number;
	woodcutting_max_xp: number;
	fishing_level: number;
	fishing_xp: number;
	fishing_max_xp: number;
	weaponcrafting_level: number;
	weaponcrafting_xp: number;
	weaponcrafting_max_xp: number;
	gearcrafting_level: number;
	gearcrafting_xp: number;
	gearcrafting_max_xp: number;
	jewelrycrafting_level: number;
	jewelrycrafting_xp: number;
	jewelrycrafting_max_xp: number;
	cooking_level: number;
	cooking_xp: number;
	cooking_max_xp: number;
	alchemy_level: number;
	alchemy_xp: number;
	alchemy_max_xp: number;
	hp: number;
	max_hp: number;
	haste: number;
	critical_strike: number;
	stamina: number;
	attack_fire: number;
	attack_earth: number;
	attack_water: number;
	attack_air: number;
	dmg_fire: number;
	dmg_earth: number;
	dmg_water: number;
	dmg_air: number;
	res_fire: number;
	res_earth: number;
	res_water: number;
	res_air: number;
	x: number;
	y: number;
	cooldown: number;
	cooldown_expiration: Date;
	weapon_slot: string;
	shield_slot: string;
	helmet_slot: string;
	body_armor_slot: string;
	leg_armor_slot: string;
	boots_slot: string;
	ring1_slot: string;
	ring2_slot: string;
	amulet_slot: string;
	artifact1_slot: string;
	artifact2_slot: string;
	artifact3_slot: string;
	utility1_slot: string;
	utility1_slot_quantity: number;
	utility2_slot: string;
	utility2_slot_quantity: number;
	task: string;
	task_type: string;
	task_progress: number;
	task_total: number;
	inventory_max_items: number;
	inventory: Inventory[];
};

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
};

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
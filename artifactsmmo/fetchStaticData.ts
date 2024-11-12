// deno run --allow-net --allow-read --allow-write artifactsmmo/fetchStaticData.ts
import { ARTIFACTS_BASE_URL } from "./constants.ts";
import { DataItem, Destination } from "./types.ts";
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
				}
			);
	}

	await Deno.writeFile(
		"./items.json",
		encoder.encode(JSON.stringify(items, null, 2))
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
				}
			);
	}

	await Deno.writeFile(
		"./maps.json",
		encoder.encode(JSON.stringify(maps, null, 2))
	);
};
fetchMaps();
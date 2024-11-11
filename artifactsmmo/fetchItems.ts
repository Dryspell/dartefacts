// deno run --allow-net --allow-read --allow-write artifactsmmo/items.ts
import { ARTIFACTS_BASE_URL } from "./constants.ts";
import { DataItem } from "./types.ts";
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

fetchItems();

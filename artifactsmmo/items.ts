import items from "./items.json" with { type: "json" };

console.log(JSON.stringify(items.filter(item => item.level < 3 && item.craft?.items.some(craftRecipe => craftRecipe.code === "copper")), null, 2));
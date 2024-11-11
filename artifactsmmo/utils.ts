export function sleep(ms: number, message?: string) {
	console.log(`Sleeping for ${ms}ms`, message);
	return new Promise((resolve) => setTimeout(resolve, ms));
}

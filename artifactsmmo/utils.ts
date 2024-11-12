export function sleep(ms: number, message?: string, characterName?: string) {
  console.log(
    `${characterName ? `[${characterName}] ` : ""}Sleeping for ${ms}ms`,
    message,
  );
  return new Promise((resolve) => setTimeout(resolve, ms));
}

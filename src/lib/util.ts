export function generateRandomInt(max?: number) {
  return Math.floor(Math.random() * (max ?? Number.MAX_SAFE_INTEGER));
}

export function reverseObject(obj: any) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));
}

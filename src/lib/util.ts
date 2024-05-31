export function reverseObject(obj: any) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));
}

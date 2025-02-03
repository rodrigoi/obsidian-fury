export type CamelCase<S extends string> =
  S extends `${infer P1} ${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
    : Lowercase<S>;

export const TRULY_REMOTE_CATEGORIES = [
  "Development",
  "Marketing",
  "Product",
  "Business",
  "Sales",
  "Customer Service",
] as const;

export type TrulyRemoteCategory = (typeof TRULY_REMOTE_CATEGORIES)[number];

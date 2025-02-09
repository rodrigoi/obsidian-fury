import type { CamelCase } from "@/types";

export const toCamelCase = <S extends string>(str: S): CamelCase<S> => {
  return str.replace(/(?:^|_)(\w)/g, (_, letter) =>
    letter.toUpperCase()
  ) as CamelCase<S>;
};

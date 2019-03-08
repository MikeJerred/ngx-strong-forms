import { TypedFormArray } from './TypedFormArray';
import { TypedFormControl } from './TypedFormControl';
import { TypedFormDictionary } from './TypedFormDictionary';
import { TypedFormGroup } from './TypedFormGroup';

export function fromEntries<T, K extends number | string | symbol>(pairs: Iterable<[K, T]> | ArrayLike<[K, T]>): Record<K ,T> {
  return Object.assign({}, ...Array.from(pairs, ([k, v]) => ({ [k]: v })));
}

export type ValueType<T> =
  T extends TypedFormArray<infer U> ? U[]
  : T extends TypedFormControl<infer U> ? U
  : T extends TypedFormDictionary<infer U> ? Map<string, U>
  : T extends TypedFormGroup<infer U> ? { [P in keyof U]: ValueType<U[P]> }
  : T extends {} ? { [P in keyof T]: ValueType<T[P]> }
  : never;

export type NotUnion<T> =
  [T] extends [infer U] ?
    U extends any ?
      [T] extends [U] ? T
      : never
    : never
  : never;

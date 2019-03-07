import { TypedFormArray } from './TypedFormArray';
import { TypedFormControl } from './TypedFormControl';
import { TypedFormGroup } from './TypedFormGroup';
import { TypedFormRecord } from './TypedFormRecord';

export function fromEntries<T, K extends number | string | symbol>(pairs: Iterable<[K, T]> | ArrayLike<[K, T]>): Record<K ,T> {
  return Object.assign({}, ...Array.from(pairs, ([k, v]) => ({ [k]: v })));
}

export type ValueType<T> =
  T extends TypedFormArray<infer U> ? U[]
  : T extends TypedFormControl<infer U> ? U
  : T extends TypedFormGroup<infer U> ? { [P in keyof U]: ValueType<U[P]> }
  : T extends TypedFormRecord<infer U> ? Record<string, U>
  : T extends {} ? { [P in keyof T]: ValueType<T[P]> }
  : never;

export type NotUnion<T> =
  [T] extends [infer U] ?
    U extends any ?
      [T] extends [U] ? T
      : never
    : never
  : never;

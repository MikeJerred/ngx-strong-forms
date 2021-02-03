import { Validators, ValidationErrors } from '@angular/forms';
import { from, Observable } from 'rxjs';
import { Subscribable } from 'rxjs';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators'

import { TypedAsyncValidator, TypedAsyncValidatorFn, TypedValidator, TypedValidatorFn } from './directives/validators';
import { AbstractTypedControl } from './models';

export class TypedValidators {
  /**
   * @description
   * Validator that requires the control's value to be greater than or equal to the provided number.
   * The validator exists only as a function and not as a directive.
   *
   * @usageNotes
   *
   * ### Validate against a minimum of 3
   *
   * ```typescript
   * const control = new FormControl(2, Validators.min(3));
   *
   * console.log(control.errors); // {min: {min: 3, actual: 2}}
   * ```
   *
   * @returns A validator function that returns an error map with the
   * `min` property if the validation check fails, otherwise `null`.
   *
   * @see `updateValueAndValidity()`
   *
   */
  static min<T extends AbstractTypedControl>(min: number): TypedValidatorFn<T> {
    return (control: T) => Validators.min(min)(control.ng);
  }

  /**
   * @description
   * Validator that requires the control's value to be less than or equal to the provided number.
   * The validator exists only as a function and not as a directive.
   *
   * @usageNotes
   *
   * ### Validate against a maximum of 15
   *
   * ```typescript
   * const control = new FormControl(16, Validators.max(15));
   *
   * console.log(control.errors); // {max: {max: 15, actual: 16}}
   * ```
   *
   * @returns A validator function that returns an error map with the
   * `max` property if the validation check fails, otherwise `null`.
   *
   * @see `updateValueAndValidity()`
   *
   */
  static max<T extends AbstractTypedControl>(max: number): TypedValidatorFn<T> {
    return (control: T) => Validators.max(max)(control.ng);
  }

  /**
   * @description
   * Validator that requires the control have a non-empty value.
   *
   * @usageNotes
   *
   * ### Validate that the field is non-empty
   *
   * ```typescript
   * const control = new FormControl('', Validators.required);
   *
   * console.log(control.errors); // {required: true}
   * ```
   *
   * @returns An error map with the `required` property
   * if the validation check fails, otherwise `null`.
   *
   * @see `updateValueAndValidity()`
   *
   */
  static required<T extends AbstractTypedControl>(control: T): ValidationErrors|null {
    return Validators.required(control.ng);
  }

  /**
   * @description
   * Validator that requires the control's value be true. This validator is commonly
   * used for required checkboxes.
   *
   * @usageNotes
   *
   * ### Validate that the field value is true
   *
   * ```typescript
   * const control = new FormControl('', Validators.requiredTrue);
   *
   * console.log(control.errors); // {required: true}
   * ```
   *
   * @returns An error map that contains the `required` property
   * set to `true` if the validation check fails, otherwise `null`.
   *
   * @see `updateValueAndValidity()`
   *
   */
  static requiredTrue<T extends AbstractTypedControl>(control: T): ValidationErrors|null {
    return Validators.requiredTrue(control.ng);
  }

  /**
   * @description
   * Validator that requires the control's value pass an email validation test.
   *
   * Tests the value using a [regular
   * expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
   * pattern suitable for common usecases. The pattern is based on the definition of a valid email
   * address in the [WHATWG HTML
   * specification](https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address) with
   * some enhancements to incorporate more RFC rules (such as rules related to domain names and the
   * lengths of different parts of the address).
   *
   * The differences from the WHATWG version include:
   * - Disallow `local-part` (the part before the `@` symbol) to begin or end with a period (`.`).
   * - Disallow `local-part` to be longer than 64 characters.
   * - Disallow the whole address to be longer than 254 characters.
   *
   * If this pattern does not satisfy your business needs, you can use `Validators.pattern()` to
   * validate the value against a different pattern.
   *
   * @usageNotes
   *
   * ### Validate that the field matches a valid email pattern
   *
   * ```typescript
   * const control = new FormControl('bad@', Validators.email);
   *
   * console.log(control.errors); // {email: true}
   * ```
   *
   * @returns An error map with the `email` property
   * if the validation check fails, otherwise `null`.
   *
   * @see `updateValueAndValidity()`
   *
   */
  static email<T extends AbstractTypedControl>(control: T): ValidationErrors|null {
    return Validators.email(control.ng);
  }

  /**
   * @description
   * Validator that requires the length of the control's value to be greater than or equal
   * to the provided minimum length. This validator is also provided by default if you use the
   * the HTML5 `minlength` attribute. Note that the `minLength` validator is intended to be used
   * only for types that have a numeric `length` property, such as strings or arrays. The
   * `minLength` validator logic is also not invoked for values when their `length` property is 0
   * (for example in case of an empty string or an empty array), to support optional controls. You
   * can use the standard `required` validator if empty values should not be considered valid.
   *
   * @usageNotes
   *
   * ### Validate that the field has a minimum of 3 characters
   *
   * ```typescript
   * const control = new FormControl('ng', Validators.minLength(3));
   *
   * console.log(control.errors); // {minlength: {requiredLength: 3, actualLength: 2}}
   * ```
   *
   * ```html
   * <input minlength="5">
   * ```
   *
   * @returns A validator function that returns an error map with the
   * `minlength` property if the validation check fails, otherwise `null`.
   *
   * @see `updateValueAndValidity()`
   *
   */
  static minLength<T extends AbstractTypedControl>(minLength: number): TypedValidatorFn<T> {
    return (control: T) => Validators.minLength(minLength)(control.ng);
  }

  /**
   * @description
   * Validator that requires the length of the control's value to be less than or equal
   * to the provided maximum length. This validator is also provided by default if you use the
   * the HTML5 `maxlength` attribute. Note that the `maxLength` validator is intended to be used
   * only for types that have a numeric `length` property, such as strings or arrays.
   *
   * @usageNotes
   *
   * ### Validate that the field has maximum of 5 characters
   *
   * ```typescript
   * const control = new FormControl('Angular', Validators.maxLength(5));
   *
   * console.log(control.errors); // {maxlength: {requiredLength: 5, actualLength: 7}}
   * ```
   *
   * ```html
   * <input maxlength="5">
   * ```
   *
   * @returns A validator function that returns an error map with the
   * `maxlength` property if the validation check fails, otherwise `null`.
   *
   * @see `updateValueAndValidity()`
   *
   */
  static maxLength<T extends AbstractTypedControl>(maxLength: number): TypedValidatorFn<T> {
    return (control: T) => Validators.maxLength(maxLength)(control.ng);
  }

  /**
   * @description
   * Validator that requires the control's value to match a regex pattern. This validator is also
   * provided by default if you use the HTML5 `pattern` attribute.
   *
   * @usageNotes
   *
   * ### Validate that the field only contains letters or spaces
   *
   * ```typescript
   * const control = new FormControl('1', Validators.pattern('[a-zA-Z ]*'));
   *
   * console.log(control.errors); // {pattern: {requiredPattern: '^[a-zA-Z ]*$', actualValue: '1'}}
   * ```
   *
   * ```html
   * <input pattern="[a-zA-Z ]*">
   * ```
   *
   * ### Pattern matching with the global or sticky flag
   *
   * `RegExp` objects created with the `g` or `y` flags that are passed into `Validators.pattern`
   * can produce different results on the same input when validations are run consecutively. This is
   * due to how the behavior of `RegExp.prototype.test` is
   * specified in [ECMA-262](https://tc39.es/ecma262/#sec-regexpbuiltinexec)
   * (`RegExp` preserves the index of the last match when the global or sticky flag is used).
   * Due to this behavior, it is recommended that when using
   * `Validators.pattern` you **do not** pass in a `RegExp` object with either the global or sticky
   * flag enabled.
   *
   * ```typescript
   * // Not recommended (since the `g` flag is used)
   * const controlOne = new FormControl('1', Validators.pattern(/foo/g));
   *
   * // Good
   * const controlTwo = new FormControl('1', Validators.pattern(/foo/));
   * ```
   *
   * @param pattern A regular expression to be used as is to test the values, or a string.
   * If a string is passed, the `^` character is prepended and the `$` character is
   * appended to the provided string (if not already present), and the resulting regular
   * expression is used to test the values.
   *
   * @returns A validator function that returns an error map with the
   * `pattern` property if the validation check fails, otherwise `null`.
   *
   * @see `updateValueAndValidity()`
   *
   */
  static pattern<T extends AbstractTypedControl>(pattern: string|RegExp): TypedValidatorFn<T> {
    return (control: T) => Validators.pattern(pattern)(control.ng);
  }

  /**
   * @description
   * Validator that performs no operation.
   *
   * @see `updateValueAndValidity()`
   *
   */
  static nullValidator<T extends AbstractTypedControl>(control: T): ValidationErrors|null {
    return Validators.nullValidator(control.ng);
  }

  /**
   * @description
   * Compose multiple validators into a single function that returns the union
   * of the individual error maps for the provided control.
   *
   * @returns A validator function that returns an error map with the
   * merged error maps of the validators if the validation check fails, otherwise `null`.
   *
   * @see `updateValueAndValidity()`
   *
   */
  static compose<T extends AbstractTypedControl>(validators: null): null;
  static compose<T extends AbstractTypedControl>(validators: (TypedValidatorFn<T>|null|undefined)[]): TypedValidatorFn<T>|null;
  static compose<T extends AbstractTypedControl>(validators: (TypedValidatorFn<T>|null|undefined)[]|null): TypedValidatorFn<T>|null {
    if (!validators) return null;
    const presentValidators: TypedValidatorFn<T>[] = validators.filter(isPresent) as any;
    if (presentValidators.length == 0) return null;

    return function(control: T) {
      return mergeErrors(executeValidators<T, TypedValidatorFn<T>>(control, presentValidators));
    };
  }

  /**
   * @description
   * Compose multiple async validators into a single function that returns the union
   * of the individual error objects for the provided control.
   *
   * @returns A validator function that returns an error map with the
   * merged error objects of the async validators if the validation check fails, otherwise `null`.
   *
   * @see `updateValueAndValidity()`
   *
   */
  static composeAsync<T extends AbstractTypedControl>(validators: (TypedAsyncValidatorFn<T>|null)[]): TypedAsyncValidatorFn<T>|null {
    if (!validators) return null;
    const presentValidators: TypedAsyncValidatorFn<T>[] = validators.filter(isPresent) as any;
    if (presentValidators.length == 0) return null;

    return function(control: T) {
      const observables =
          executeValidators<T, TypedAsyncValidatorFn<T>>(control, presentValidators).map(toObservable);
      return forkJoin(observables).pipe(map(mergeErrors));
    };
  }
}

function isPresent(o: any): boolean {
  return o != null;
}

export function toObservable(r: any): Observable<any> {
  const obs = isPromise(r) ? from(r) : r;
  if (!(isObservable(obs))) {
    throw new Error(`Expected validator to return Promise or Observable.`);
  }
  return obs;
}

function mergeErrors(arrayOfErrors: (ValidationErrors|null)[]): ValidationErrors|null {
  let res: {[key: string]: any} = {};

  // Not using Array.reduce here due to a Chrome 80 bug
  // https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
  arrayOfErrors.forEach((errors: ValidationErrors|null) => {
    res = errors != null ? {...res!, ...errors} : res!;
  });

  return Object.keys(res).length === 0 ? null : res;
}


type GenericValidatorFn<T extends AbstractTypedControl> = (control: T) => any;

function executeValidators<T extends AbstractTypedControl, V extends GenericValidatorFn<T>>(
    control: T,
    validators: V[]
): ReturnType<V>[] {
  return validators.map(validator => validator(control));
}

function isValidatorFn<V, T extends AbstractTypedControl>(
  validator: V|TypedValidator<T>|TypedAsyncValidator<T>
): validator is V {
  return !(validator as TypedValidator<T>).validate;
}

/**
 * Given the list of validators that may contain both functions as well as classes, return the list
 * of validator functions (convert validator classes into validator functions). This is needed to
 * have consistent structure in validators list before composing them.
 *
 * @param validators The set of validators that may contain validators both in plain function form
 *     as well as represented as a validator class.
 */
export function normalizeValidators<V, T extends AbstractTypedControl>(
  validators: (V|TypedValidator<T>|TypedAsyncValidator<T>)[]
): V[] {
  return validators.map(validator => {
    return isValidatorFn<V, T>(validator) ?
        validator :
        ((c: T) => validator.validate(c)) as unknown as V;
  });
}

/**
 * Merges synchronous validators into a single validator function (combined using
 * `Validators.compose`).
 */
export function composeValidators<T extends AbstractTypedControl>(
  validators: Array<TypedValidator<T>|TypedValidatorFn<T>>
): TypedValidatorFn<T>|null {
  return validators != null ? TypedValidators.compose(normalizeValidators<TypedValidatorFn<T>, T>(validators)) : null;
}

/**
 * Merges asynchronous validators into a single validator function (combined using
 * `Validators.composeAsync`).
 */
export function composeAsyncValidators<T extends AbstractTypedControl>(
  validators: Array<TypedAsyncValidator<T>|TypedAsyncValidatorFn<T>>
): TypedAsyncValidatorFn<T>|null {
  return validators != null ? TypedValidators.composeAsync(normalizeValidators<TypedAsyncValidatorFn<T>, T>(validators)) : null;
}

/**
 * Determine if the argument is shaped like a Promise
 */
export function isPromise<T = any>(obj: any): obj is Promise<T> {
  // allow any Promise/A+ compliant thenable.
  // It's up to the caller to ensure that obj.then conforms to the spec
  return !!obj && typeof obj.then === 'function';
}

/**
 * Determine if the argument is a Subscribable
 */
export function isSubscribable(obj: any|Subscribable<any>): obj is Subscribable<any> {
  return !!obj && typeof obj.subscribe === 'function';
}

/**
 * Determine if the argument is an Observable
 *
 * Strictly this tests that the `obj` is `Subscribable`, since `Observable`
 * types need additional methods, such as `lift()`. But it is adequate for our
 * needs since within the Angular framework code we only ever need to use the
 * `subscribe()` method, and RxJS has mechanisms to wrap `Subscribable` objects
 * into `Observable` as needed.
 */
export const isObservable = isSubscribable as ((obj: any|Observable<any>) => obj is Observable<any>);

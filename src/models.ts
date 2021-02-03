import { AbstractControl, FormArray, FormControl, FormGroup, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';

import { TypedAsyncValidatorFn, TypedValidatorFn } from './directives/validators';
import { composeAsyncValidators, composeValidators } from './validators';

function fromEntries<T, K extends number | string | symbol>(pairs: Iterable<[K, T]> | ArrayLike<[K, T]>): Record<K ,T> {
  return Object.assign({}, ...Array.from(pairs, ([k, v]) => ({ [k]: v })));
}

export type ValueType<T> =
  T extends TypedFormArray<infer U> ? ValueType<U>[]
  : T extends TypedFormControl<infer V> ? V | null
  : T extends TypedFormDictionary<infer W> ? { [key: string]: ValueType<W> }
  : T extends TypedFormGroup<infer X> ? { [K in keyof X]: ValueType<X[K]> }
  : T extends {} ? { [K in keyof T]: ValueType<T[K]> }
  : never;

export type NotUnion<T> =
  [T] extends [infer U] ?
    U extends any ?
      [T] extends [U] ? T
      : never
    : never
  : never;

export const VALID = 'VALID';
export const INVALID = 'INVALID';
export const PENDING = 'PENDING';
export const DISABLED = 'DISABLED';

function _find(control: AbstractTypedControl, path: Array<string | number> | string, delimiter: string) {
  if (path == null) return null;

  if (!Array.isArray(path)) {
    path = path.split(delimiter);
  }
  if (Array.isArray(path) && path.length === 0) return null;

  // Not using Array.reduce here due to a Chrome 80 bug
  // https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
  let controlToFind: AbstractTypedControl | null = control;
  path.forEach((name: string | number) => {
    if (controlToFind instanceof TypedFormArray) {
      controlToFind = controlToFind.at(name as number) || null;
    } else if (controlToFind instanceof TypedFormDictionary) {
      controlToFind = controlToFind.controls.has(name as string) ? controlToFind.controls.get(name as string) : null;
    } else if (controlToFind instanceof TypedFormGroup) {
      controlToFind = controlToFind.controls.hasOwnProperty(name as string) ? controlToFind.controls[name] : null;
    } else {
      controlToFind = null;
    }
  });
  return controlToFind;
}

/**
 * Gets validators from either an options object or given validators.
 */
function pickValidators<T extends AbstractTypedControl>(validatorOrOpts?: TypedValidatorFn<T>|
  TypedValidatorFn<T>[]|TypedAbstractControlOptions<T>|null
): TypedValidatorFn<T>|TypedValidatorFn<T>[]|null {
  return (isOptionsObj(validatorOrOpts) ? validatorOrOpts.validators : validatorOrOpts) || null;
}

/**
 * Creates validator function by combining provided validators.
 */
function coerceToValidator<T extends AbstractTypedControl>(
  validator: TypedValidatorFn<T>|TypedValidatorFn<T>[]|null
): TypedValidatorFn<T>|null {
  return Array.isArray(validator) ? composeValidators(validator) : validator || null;
}

/**
 * Gets async validators from either an options object or given validators.
 */
function pickAsyncValidators<T extends AbstractTypedControl>(
  asyncValidator?: TypedAsyncValidatorFn<T>|TypedAsyncValidatorFn<T>[]|null,
  validatorOrOpts?: TypedValidatorFn<T>|TypedValidatorFn<T>[]|TypedAbstractControlOptions<T>|null
): TypedAsyncValidatorFn<T>|TypedAsyncValidatorFn<T>[]|null {
  return (isOptionsObj(validatorOrOpts) ? validatorOrOpts.asyncValidators : asyncValidator) || null;
}

/**
 * Creates async validator function by combining provided async validators.
 */
function coerceToAsyncValidator<T extends AbstractTypedControl>(
  asyncValidator?: TypedAsyncValidatorFn<T>|TypedAsyncValidatorFn<T>[]|null
): TypedAsyncValidatorFn<T>|null {
  return Array.isArray(asyncValidator) ? composeAsyncValidators(asyncValidator) : asyncValidator || null;
}

export declare interface TypedAbstractControlOptions<T extends AbstractTypedControl> {
  /**
   * @description
   * The list of validators applied to a control.
   */
  validators?: TypedValidatorFn<T> | TypedValidatorFn<T>[] | null;
  /**
   * @description
   * The list of async validators applied to control.
   */
  asyncValidators?: TypedAsyncValidatorFn<T> | TypedAsyncValidatorFn<T>[] | null;
  /**
   * @description
   * The event name for control to update upon.
   */
  updateOn?: 'change' | 'blur' | 'submit';
}

function isOptionsObj<T extends AbstractTypedControl>(
  validatorOrOpts?: TypedValidatorFn<T>|TypedValidatorFn<T>[]|TypedAbstractControlOptions<T>|null
): validatorOrOpts is TypedAbstractControlOptions<T> {
  return validatorOrOpts != null && !Array.isArray(validatorOrOpts) && typeof validatorOrOpts === 'object';
}

function toNgUpdateOn<T extends AbstractTypedControl>(
  validatorOrOpts?: TypedValidatorFn<T> | TypedValidatorFn<T>[] | TypedAbstractControlOptions<T> | null
): 'change' | 'blur' | 'submit' | undefined {
  if (!validatorOrOpts) return undefined;

  if (isOptionsObj(validatorOrOpts)) return validatorOrOpts.updateOn;

  return undefined;
}

function toNgValidator<T extends AbstractTypedControl>(control: T, validatorFn: TypedValidatorFn<T>): ValidatorFn;
function toNgValidator<T extends AbstractTypedControl>(
  control: T,
  validatorFn: TypedValidatorFn<T> | null
): ValidatorFn | null;
function toNgValidator<T extends AbstractTypedControl>(control: T, validatorFn: TypedValidatorFn<T>[]): ValidatorFn[];
function toNgValidator<T extends AbstractTypedControl>(
  control: T,
  validatorFn: TypedValidatorFn<T>[] | null
): ValidatorFn[] | null;
function toNgValidator<T extends AbstractTypedControl>(
  control: T,
  validatorFn: TypedValidatorFn<T> | TypedValidatorFn<T>[]
): ValidatorFn | ValidatorFn[];
function toNgValidator<T extends AbstractTypedControl>(
  control: T,
  validatorFn?: TypedValidatorFn<T> | TypedValidatorFn<T>[] | null
): ValidatorFn | ValidatorFn[] | null;
function toNgValidator<T extends AbstractTypedControl>(
  control: T,
  validatorFn?: TypedValidatorFn<T> | TypedValidatorFn<T>[] | null
): ValidatorFn | ValidatorFn[] | null {
  if (!validatorFn) return null;
  if (Array.isArray(validatorFn)) return validatorFn.map(v => toNgValidator(control, v));

  // tslint:disable-next-line: only-arrow-functions
  return function(ngControl: AbstractControl) {
    return validatorFn(control);
  };
}

function toNgAsyncValidator<T extends AbstractTypedControl>(control: T, asyncValidatorFn: TypedAsyncValidatorFn<T>): AsyncValidatorFn;
function toNgAsyncValidator<T extends AbstractTypedControl>(
  control: T,
  asyncValidatorFn: TypedAsyncValidatorFn<T> | null
): AsyncValidatorFn | null;
function toNgAsyncValidator<T extends AbstractTypedControl>(control: T, asyncValidatorFn: TypedAsyncValidatorFn<T>[]): AsyncValidatorFn[];
function toNgAsyncValidator<T extends AbstractTypedControl>(
  control: T,
  asyncValidatorFn: TypedAsyncValidatorFn<T>[] | null
): AsyncValidatorFn[] | null;
function toNgAsyncValidator<T extends AbstractTypedControl>(
  control: T,
  asyncValidatorFn: TypedAsyncValidatorFn<T> | TypedAsyncValidatorFn<T>[]
): AsyncValidatorFn | AsyncValidatorFn[];
function toNgAsyncValidator<T extends AbstractTypedControl>(
  control: T,
  asyncValidator?: TypedAsyncValidatorFn<T> | TypedAsyncValidatorFn<T>[] | null
): AsyncValidatorFn | AsyncValidatorFn[] | null;
function toNgAsyncValidator<T extends AbstractTypedControl>(
  control: T,
  asyncValidator?: TypedAsyncValidatorFn<T> | TypedAsyncValidatorFn<T>[] | null
): AsyncValidatorFn | AsyncValidatorFn[] | null {
  if (!asyncValidator) return null;
  if (Array.isArray(asyncValidator)) return asyncValidator.map(v => toNgAsyncValidator(control, v));

  // tslint:disable-next-line: only-arrow-functions
  return function(ngControl: AbstractControl) {
    return asyncValidator(control);
  };
}

export abstract class AbstractTypedControl {
  private _parent: TypedFormArray<any> | TypedFormDictionary<any> | TypedFormGroup<any> | null = null;

  abstract get ng(): AbstractControl;

  get value() { return this.ng.value; }
  get parent() { return this._parent; }
  get status() { return this.ng.status; }
  get valid() { return this.ng.valid; }
  get invalid() { return this.ng.invalid; }
  get pending() { return this.ng.pending; }
  get disabled() { return this.ng.disabled; }
  get enabled() { return this.ng.enabled; }
  get errors() { return this.ng.errors; }
  get pristine() { return this.ng.pristine; }
  get dirty() { return this.ng.dirty; }
  get touched() { return this.ng.touched; }
  get untouched() { return this.ng.untouched; }
  get valueChanges() { return this.ng.valueChanges; }
  get statusChanges() { return this.ng.statusChanges; }
  get updateOn() { return this.ng.updateOn; }
  markAsTouched(opts: { onlySelf?: boolean } = {}) { return this.ng.markAsTouched(opts); }
  markAllAsTouched() { return this.ng.markAllAsTouched(); }
  markAsUntouched(opts: { onlySelf?: boolean } = {}) { return this.ng.markAsUntouched(opts); }
  markAsDirty(opts: { onlySelf?: boolean } = {}) { return this.ng.markAsDirty(opts); }
  markAsPristine(opts: { onlySelf?: boolean } = {}) { return this.ng.markAsPristine(opts); }
  markAsPending(opts: { onlySelf?: boolean, emitEvent?: boolean } = {}) { return this.ng.markAsPending(opts); }
  disable(opts: { onlySelf?: boolean, emitEvent?: boolean } = {}) { return this.ng.disable(opts); }
  enable(opts: { onlySelf?: boolean, emitEvent?: boolean } = {}) { return this.ng.enable(opts); }

  setParent(parent: TypedFormArray<any> | TypedFormDictionary<any> | TypedFormGroup<any>): void {
    this._parent = parent;
    this.ng.setParent(parent.ng);
  }

  abstract setValue(value: any, options?: Object): void;
  abstract patchValue(value: any, options?: Object): void;
  abstract reset(value?: any, options?: Object): void;

  updateValueAndValidity(opts: { onlySelf?: boolean, emitEvent?: boolean } = {}) { return this.ng.updateValueAndValidity(opts); }
  setErrors(errors: ValidationErrors | null, opts: { emitEvent?: boolean } = {}) { return this.ng.setErrors(errors, opts); }

  get(path: Array<string | number> | string) {
    return _find(this, path, '.');
  }

  getError(errorCode: string, path?: string[]) { return this.ng.getError(errorCode, path); }
  hasError(errorCode: string, path?: string[]) { return this.ng.hasError(errorCode, path); }

  get root() {
    let x: AbstractTypedControl = this;

    while (x._parent) x = x._parent;

    return x;
  }
}

export class TypedFormArray<T extends AbstractTypedControl> extends AbstractTypedControl {
  private _ng: FormArray;
  private _controls: T[];

  /**
   * Contains the result of merging synchronous validators into a single validator function
   * (combined using `Validators.compose`).
   *
   * @internal
   */
  private _composedValidatorFn: TypedValidatorFn<TypedFormArray<T>>|null;

  /**
   * Contains the result of merging asynchronous validators into a single validator function
   * (combined using `Validators.composeAsync`).
   *
   * @internal
   */
  private _composedAsyncValidatorFn: TypedAsyncValidatorFn<TypedFormArray<T>>|null;

  /**
   * Synchronous validators as they were provided:
   *  - in `AbstractControl` constructor
   *  - as an argument while calling `setValidators` function
   *  - while calling the setter on the `validator` field (e.g. `control.validator = validatorFn`)
   *
   * @internal
   */
  private _rawValidators: TypedValidatorFn<TypedFormArray<T>>|TypedValidatorFn<TypedFormArray<T>>[]|null;

  /**
   * Asynchronous validators as they were provided:
   *  - in `AbstractControl` constructor
   *  - as an argument while calling `setAsyncValidators` function
   *  - while calling the setter on the `asyncValidator` field (e.g. `control.asyncValidator =
   * asyncValidatorFn`)
   *
   * @internal
   */
  private _rawAsyncValidators: TypedAsyncValidatorFn<TypedFormArray<T>>|TypedAsyncValidatorFn<TypedFormArray<T>>[]|null;

  constructor(
    controls: T[],
    validatorOrOpts?: TypedValidatorFn<TypedFormArray<T>> |
      TypedValidatorFn<TypedFormArray<T>>[] |
      TypedAbstractControlOptions<TypedFormArray<T>> |
      null,
    asyncValidator?: TypedAsyncValidatorFn<TypedFormArray<T>> | TypedAsyncValidatorFn<TypedFormArray<T>>[] | null
  ) {
    super();
    this._rawValidators = pickValidators(validatorOrOpts);
    this._rawAsyncValidators = pickAsyncValidators(asyncValidator, validatorOrOpts);
    this._composedValidatorFn = coerceToValidator(this._rawValidators);
    this._composedAsyncValidatorFn = coerceToAsyncValidator(this._rawAsyncValidators);
    this._ng = new FormArray(
      controls.map(ctrl => ctrl.ng),
      { updateOn: toNgUpdateOn(validatorOrOpts) }
    );
    this._ng.setValidators(toNgValidator(this, this._rawValidators));
    this._ng.setAsyncValidators(toNgAsyncValidator(this, this._rawAsyncValidators));
    this._ng.updateValueAndValidity({ emitEvent: false });
    this._controls = controls;
  }

  get controls(): T[] { return this._controls; }

  get ng(): FormArray { return this._ng; }

  get value(): ValueType<T>[] { return this.ng.value; }
  get valueChanges(): Observable<ValueType<T>[]> { return this.ng.valueChanges; }

  get validator() { return this._composedValidatorFn; }
  set validator(validatorFn: TypedValidatorFn<TypedFormArray<T>>|null) {
    this._rawValidators = this._composedValidatorFn = validatorFn;
  }
  get asyncValidator() { return this._composedAsyncValidatorFn; }
  set asyncValidator(asyncValidatorFn: TypedAsyncValidatorFn<TypedFormArray<T>>|null) {
    this._rawAsyncValidators = this._composedAsyncValidatorFn = asyncValidatorFn;
  }

  setValidators(newValidator: TypedValidatorFn<TypedFormArray<T>> | TypedValidatorFn<TypedFormArray<T>>[] | null) {
    this._rawValidators = newValidator;
    this._composedValidatorFn = coerceToValidator(newValidator);
    this.ng.setValidators(toNgValidator(this, newValidator));
  }

  setAsyncValidators(
    newAsyncValidator: TypedAsyncValidatorFn<TypedFormArray<T>> |
      TypedAsyncValidatorFn<TypedFormArray<T>>[] |
      null
  ) {
    this._rawAsyncValidators = newAsyncValidator;
    this._composedAsyncValidatorFn = coerceToAsyncValidator(newAsyncValidator);
    this.ng.setAsyncValidators(toNgAsyncValidator(this, newAsyncValidator));
  }

  clearValidators() {
    this.validator = null;
    this.ng.clearValidators();
  }
  clearAsyncValidators() {
    this.asyncValidator = null;
    this.ng.clearAsyncValidators();
  }

  at(index: number): T { return this.controls[index]; }

  push(control: T): void {
    this._controls.push(control);
    control.setParent(this);

    this.ng.push(control.ng);
  }

  insert(index: number, control: T): void {
    this._controls.splice(index, 0, control);
    control.setParent(this);

    this.ng.insert(index, control.ng);
  }

  removeAt(index: number): void {
    this._controls.splice(index, 1);
    this.ng.removeAt(index);
  }

  setControl(index: number, control: T): void {
    this._controls.splice(index, 1);

    if (control) {
      this._controls.splice(index, 0, control);
      control.setParent(this);
    }

    this.ng.setControl(index, control.ng);
  }

  get length(): number { return this.controls.length; }
  setValue(value: ValueType<T>[], options: { onlySelf?: boolean, emitEvent?: boolean } = {}): void { this.ng.setValue(value, options); }
  patchValue(value: ValueType<T>[], options: { onlySelf?: boolean, emitEvent?: boolean } = {}): void { this.ng.patchValue(value, options); }
  reset(value: ValueType<T>[] = [], options: { onlySelf?: boolean, emitEvent?: boolean } = {}): void { this.ng.reset(value, options); }
  getRawValue(): ValueType<T>[] { return this.ng.getRawValue(); }
}

export class TypedFormControl<T> extends AbstractTypedControl {
  private _ng: FormControl;

  /**
   * Contains the result of merging synchronous validators into a single validator function
   * (combined using `Validators.compose`).
   *
   * @internal
   */
  private _composedValidatorFn: TypedValidatorFn<TypedFormControl<T>>|null;

  /**
   * Contains the result of merging asynchronous validators into a single validator function
   * (combined using `Validators.composeAsync`).
   *
   * @internal
   */
  private _composedAsyncValidatorFn: TypedAsyncValidatorFn<TypedFormControl<T>>|null;

  /**
   * Synchronous validators as they were provided:
   *  - in `AbstractControl` constructor
   *  - as an argument while calling `setValidators` function
   *  - while calling the setter on the `validator` field (e.g. `control.validator = validatorFn`)
   *
   * @internal
   */
  private _rawValidators: TypedValidatorFn<TypedFormControl<T>>|TypedValidatorFn<TypedFormControl<T>>[]|null;

  /**
   * Asynchronous validators as they were provided:
   *  - in `AbstractControl` constructor
   *  - as an argument while calling `setAsyncValidators` function
   *  - while calling the setter on the `asyncValidator` field (e.g. `control.asyncValidator =
   * asyncValidatorFn`)
   *
   * @internal
   */
  private _rawAsyncValidators: TypedAsyncValidatorFn<TypedFormControl<T>>|TypedAsyncValidatorFn<TypedFormControl<T>>[]|null;

  constructor(
    formState: T | null = null,
    validatorOrOpts?: TypedValidatorFn<TypedFormControl<T>> |
      TypedValidatorFn<TypedFormControl<T>>[] |
      TypedAbstractControlOptions<TypedFormControl<T>> |
      null,
    asyncValidator?: TypedAsyncValidatorFn<TypedFormControl<T>> | TypedAsyncValidatorFn<TypedFormControl<T>>[] | null
  ) {
    super();
    this._rawValidators = pickValidators(validatorOrOpts);
    this._rawAsyncValidators = pickAsyncValidators(asyncValidator, validatorOrOpts);
    this._composedValidatorFn = coerceToValidator(this._rawValidators);
    this._composedAsyncValidatorFn = coerceToAsyncValidator(this._rawAsyncValidators);
    this._ng = new FormControl(formState, { updateOn: toNgUpdateOn(validatorOrOpts) });
    this._ng.setValidators(toNgValidator(this, this._rawValidators));
    this._ng.setAsyncValidators(toNgAsyncValidator(this, this._rawAsyncValidators));
    this._ng.updateValueAndValidity({ emitEvent: false });
  }

  get ng(): FormControl { return this._ng; }

  get value(): T { return this.ng.value; }
  get valueChanges(): Observable<T> { return this.ng.valueChanges; }

  get validator() { return this._composedValidatorFn; }
  set validator(validatorFn: TypedValidatorFn<TypedFormControl<T>>|null) {
    this._rawValidators = this._composedValidatorFn = validatorFn;
  }
  get asyncValidator() { return this._composedAsyncValidatorFn; }
  set asyncValidator(asyncValidatorFn: TypedAsyncValidatorFn<TypedFormControl<T>>|null) {
    this._rawAsyncValidators = this._composedAsyncValidatorFn = asyncValidatorFn;
  }

  setValidators(newValidator: TypedValidatorFn<TypedFormControl<T>> | TypedValidatorFn<TypedFormControl<T>>[] | null) {
    this._rawValidators = newValidator;
    this._composedValidatorFn = coerceToValidator(newValidator);
    this.ng.setValidators(toNgValidator(this, newValidator));
  }

  setAsyncValidators(
    newAsyncValidator: TypedAsyncValidatorFn<TypedFormControl<T>> |
      TypedAsyncValidatorFn<TypedFormControl<T>>[] |
      null
  ) {
    this._rawAsyncValidators = newAsyncValidator;
    this._composedAsyncValidatorFn = coerceToAsyncValidator(newAsyncValidator);
    this.ng.setAsyncValidators(toNgAsyncValidator(this, newAsyncValidator));
  }

  clearValidators() {
    this.validator = null;
    this.ng.clearValidators();
  }
  clearAsyncValidators() {
    this.asyncValidator = null;
    this.ng.clearAsyncValidators();
  }

  setValue(
    value: T | null,
    options: {
      onlySelf?: boolean,
      emitEvent?: boolean,
      emitModelToViewChange?: boolean,
      emitViewToModelChange?: boolean
    } = {}
  ): void {
    this.ng.setValue(value, options);
  }

  patchValue(
    value: T | null,
    options: {
      onlySelf?: boolean,
      emitEvent?: boolean,
      emitModelToViewChange?: boolean,
      emitViewToModelChange?: boolean
    } = {}
  ): void {
    this.ng.patchValue(value, options);
  }

  reset(formState: T | null = null, options: { onlySelf?: boolean, emitEvent?: boolean } = {}): void { this.ng.reset(formState, options); }
  registerOnChange(fn: Function): void { this.ng.registerOnChange(fn); }
  registerOnDisabledChange(fn: (isDisabled: boolean) => void): void { this.ng.registerOnDisabledChange(fn); }
}

export class TypedFormDictionary<T extends AbstractTypedControl> extends AbstractTypedControl {
  private _ng: FormGroup;
  private _controls: Record<string, T>;

  /**
   * Contains the result of merging synchronous validators into a single validator function
   * (combined using `Validators.compose`).
   *
   * @internal
   */
  private _composedValidatorFn: TypedValidatorFn<TypedFormDictionary<T>>|null;

  /**
   * Contains the result of merging asynchronous validators into a single validator function
   * (combined using `Validators.composeAsync`).
   *
   * @internal
   */
  private _composedAsyncValidatorFn: TypedAsyncValidatorFn<TypedFormDictionary<T>>|null;

  /**
   * Synchronous validators as they were provided:
   *  - in `AbstractControl` constructor
   *  - as an argument while calling `setValidators` function
   *  - while calling the setter on the `validator` field (e.g. `control.validator = validatorFn`)
   *
   * @internal
   */
  private _rawValidators: TypedValidatorFn<TypedFormDictionary<T>>|TypedValidatorFn<TypedFormDictionary<T>>[]|null;

  /**
   * Asynchronous validators as they were provided:
   *  - in `AbstractControl` constructor
   *  - as an argument while calling `setAsyncValidators` function
   *  - while calling the setter on the `asyncValidator` field (e.g. `control.asyncValidator =
   * asyncValidatorFn`)
   *
   * @internal
   */
  private _rawAsyncValidators: TypedAsyncValidatorFn<TypedFormDictionary<T>>|TypedAsyncValidatorFn<TypedFormDictionary<T>>[]|null;

  constructor(
    controls: Record<string, NotUnion<T>>,
    validatorOrOpts?: TypedValidatorFn<TypedFormDictionary<T>> |
      TypedValidatorFn<TypedFormDictionary<T>>[] |
      TypedAbstractControlOptions<TypedFormDictionary<T>> |
      null,
    asyncValidator?: TypedAsyncValidatorFn<TypedFormDictionary<T>> | TypedAsyncValidatorFn<TypedFormDictionary<T>>[] | null
  ) {
    super();
    this._rawValidators = pickValidators(validatorOrOpts);
    this._rawAsyncValidators = pickAsyncValidators(asyncValidator, validatorOrOpts);
    this._composedValidatorFn = coerceToValidator(this._rawValidators);
    this._composedAsyncValidatorFn = coerceToAsyncValidator(this._rawAsyncValidators);
    this._ng = new FormGroup(
      fromEntries(Object.entries(controls).map(([key, ctrl]) => [key, ctrl.ng] as [string, AbstractControl])),
      { updateOn: toNgUpdateOn(validatorOrOpts) }
    );
    this._ng.setValidators(toNgValidator(this, this._rawValidators));
    this._ng.setAsyncValidators(toNgAsyncValidator(this, this._rawAsyncValidators));
    this._ng.updateValueAndValidity({ emitEvent: false });
    this._controls = controls;
  }

  get controls(): Record<string, T> {
    return this._controls;
  }

  get ng(): FormGroup { return this._ng; }

  get value(): Record<string, ValueType<T>> { return this.ng.value; }
  get valueChanges(): Observable<Record<string, ValueType<T>>> { return this.ng.valueChanges; }

  get validator() { return this._composedValidatorFn; }
  set validator(validatorFn: TypedValidatorFn<TypedFormDictionary<T>>|null) {
    this._rawValidators = this._composedValidatorFn = validatorFn;
  }
  get asyncValidator() { return this._composedAsyncValidatorFn; }
  set asyncValidator(asyncValidatorFn: TypedAsyncValidatorFn<TypedFormDictionary<T>>|null) {
    this._rawAsyncValidators = this._composedAsyncValidatorFn = asyncValidatorFn;
  }

  setValidators(newValidator: TypedValidatorFn<TypedFormDictionary<T>> | TypedValidatorFn<TypedFormDictionary<T>>[] | null) {
    this._rawValidators = newValidator;
    this._composedValidatorFn = coerceToValidator(newValidator);
    this.ng.setValidators(toNgValidator(this, newValidator));
  }

  setAsyncValidators(
    newAsyncValidator: TypedAsyncValidatorFn<TypedFormDictionary<T>> |
      TypedAsyncValidatorFn<TypedFormDictionary<T>>[] |
      null
  ) {
    this._rawAsyncValidators = newAsyncValidator;
    this._composedAsyncValidatorFn = coerceToAsyncValidator(newAsyncValidator);
    this.ng.setAsyncValidators(toNgAsyncValidator(this, newAsyncValidator));
  }

  clearValidators() {
    this.validator = null;
    this.ng.clearValidators();
  }
  clearAsyncValidators() {
    this.asyncValidator = null;
    this.ng.clearAsyncValidators();
  }

  registerControl(name: string, control: T): T {
    if (this._controls[name]) {
      return this._controls[name];
    }

    this._controls[name] = control;
    control.setParent(this);

    this.ng.registerControl(name, control.ng);
    return control;
  }

  addControl(name: string, control: T): void {
    if (!this._controls[name]) {
      this._controls[name] = control;
      control.setParent(this);
    }

    this.ng.addControl(name, control.ng);
  }

  removeControl(name: string): void {
    delete (this._controls[name]);
    this.ng.removeControl(name);
  }

  setControl(name: string, control: T): void {
    delete (this._controls[name]);
    if (control) {
      this._controls[name] = control;
      control.setParent(this);
    }

    this.ng.setControl(name, control.ng);
  }

  contains(controlName: string): boolean { return this.ng.contains(controlName); }
  setValue(value: Record<string, ValueType<T>>, options: { onlySelf?: boolean, emitEvent?: boolean } = {}): void { this.ng.setValue(value, options); }
  patchValue(value: Partial<Record<string, ValueType<T>>>, options: { onlySelf?: boolean, emitEvent?: boolean } = {}): void { this.ng.patchValue(value, options); }
  reset(value: Partial<Record<string, ValueType<T>>> | {} = {}, options: { onlySelf?: boolean, emitEvent?: boolean } = {}): void { this.ng.reset(value, options); }
  getRawValue(): Record<string, ValueType<T>> { return this.ng.getRawValue(); }
}

export class TypedFormGroup<T extends { [K in keyof T]: AbstractTypedControl }> extends AbstractTypedControl {
  private _ng: FormGroup;
  private _controls: T;

  /**
   * Contains the result of merging synchronous validators into a single validator function
   * (combined using `Validators.compose`).
   *
   * @internal
   */
  private _composedValidatorFn: TypedValidatorFn<TypedFormGroup<T>>|null;

  /**
   * Contains the result of merging asynchronous validators into a single validator function
   * (combined using `Validators.composeAsync`).
   *
   * @internal
   */
  private _composedAsyncValidatorFn: TypedAsyncValidatorFn<TypedFormGroup<T>>|null;

  /**
   * Synchronous validators as they were provided:
   *  - in `AbstractControl` constructor
   *  - as an argument while calling `setValidators` function
   *  - while calling the setter on the `validator` field (e.g. `control.validator = validatorFn`)
   *
   * @internal
   */
  private _rawValidators: TypedValidatorFn<TypedFormGroup<T>>|TypedValidatorFn<TypedFormGroup<T>>[]|null;

  /**
   * Asynchronous validators as they were provided:
   *  - in `AbstractControl` constructor
   *  - as an argument while calling `setAsyncValidators` function
   *  - while calling the setter on the `asyncValidator` field (e.g. `control.asyncValidator =
   * asyncValidatorFn`)
   *
   * @internal
   */
  private _rawAsyncValidators: TypedAsyncValidatorFn<TypedFormGroup<T>>|TypedAsyncValidatorFn<TypedFormGroup<T>>[]|null;

  constructor(
    controls: T,
    validatorOrOpts?: TypedValidatorFn<TypedFormGroup<T>> |
      TypedValidatorFn<TypedFormGroup<T>>[] |
      TypedAbstractControlOptions<TypedFormGroup<T>> |
      null,
    asyncValidator?: TypedAsyncValidatorFn<TypedFormGroup<T>> | TypedAsyncValidatorFn<TypedFormGroup<T>>[] | null
  ) {
    super();
    this._rawValidators = pickValidators(validatorOrOpts);
    this._rawAsyncValidators = pickAsyncValidators(asyncValidator, validatorOrOpts);
    this._composedValidatorFn = coerceToValidator(this._rawValidators);
    this._composedAsyncValidatorFn = coerceToAsyncValidator(this._rawAsyncValidators);
    this._ng = new FormGroup(
      fromEntries(Object.entries(controls).map(([key, ctrl]) => [key, (ctrl as AbstractTypedControl).ng] as [string, AbstractControl])),
      { updateOn: toNgUpdateOn(validatorOrOpts) }
    );
    this._ng.setValidators(toNgValidator(this, this._rawValidators));
    this._ng.setAsyncValidators(toNgAsyncValidator(this, this._rawAsyncValidators));
    this._ng.updateValueAndValidity({ emitEvent: false });
    this._controls = controls;
  }

  get controls(): T {
    return this._controls;
  }

  get ng(): FormGroup { return this._ng as FormGroup; }

  get value(): ValueType<T> { return this.ng.value; }
  get valueChanges(): Observable<ValueType<T>> { return this.ng.valueChanges; }

  get validator() { return this._composedValidatorFn; }
  set validator(validatorFn: TypedValidatorFn<TypedFormGroup<T>>|null) {
    this._rawValidators = this._composedValidatorFn = validatorFn;
  }
  get asyncValidator() { return this._composedAsyncValidatorFn; }
  set asyncValidator(asyncValidatorFn: TypedAsyncValidatorFn<TypedFormGroup<T>>|null) {
    this._rawAsyncValidators = this._composedAsyncValidatorFn = asyncValidatorFn;
  }

  setValidators(newValidator: TypedValidatorFn<TypedFormGroup<T>> | TypedValidatorFn<TypedFormGroup<T>>[] | null) {
    this._rawValidators = newValidator;
    this._composedValidatorFn = coerceToValidator(newValidator);
    this.ng.setValidators(toNgValidator(this, newValidator));
  }

  setAsyncValidators(
    newAsyncValidator: TypedAsyncValidatorFn<TypedFormGroup<T>> |
      TypedAsyncValidatorFn<TypedFormGroup<T>>[] |
      null
  ) {
    this._rawAsyncValidators = newAsyncValidator;
    this._composedAsyncValidatorFn = coerceToAsyncValidator(newAsyncValidator);
    this.ng.setAsyncValidators(toNgAsyncValidator(this, newAsyncValidator));
  }

  clearValidators() {
    this.validator = null;
    this.ng.clearValidators();
  }
  clearAsyncValidators() {
    this.asyncValidator = null;
    this.ng.clearAsyncValidators();
  }

  setControl<K extends keyof T, U extends T[K] & AbstractTypedControl>(name: K, control: U): void {
    delete (this._controls[name]);
    if (control) {
      this._controls[name] = control;
      control.setParent(this);
    }

    this.ng.setControl(name as string, control.ng);
  }

  contains(controlName: string): boolean { return this.ng.contains(controlName); }
  setValue(value: ValueType<T>, options: { onlySelf?: boolean, emitEvent?: boolean } = {}): void {
    this.ng.setValue(value as any, options);
  }
  patchValue(value: Partial<ValueType<T>>, options: { onlySelf?: boolean, emitEvent?: boolean } = {}): void {
    this.ng.patchValue(value, options);
  }
  reset(value: Partial<ValueType<T>> | {} = {}, options: { onlySelf?: boolean, emitEvent?: boolean } = {}): void {
    this.ng.reset(value, options);
  }
  getRawValue(): ValueType<T> { return this.ng.getRawValue(); }
}

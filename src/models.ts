import {
  AbstractControl, AbstractControlOptions,
  FormArray, FormControl, FormGroup,
  AsyncValidatorFn, ValidationErrors, ValidatorFn
} from '@angular/forms';
import { Observable } from 'rxjs';

function fromEntries<T, K extends number | string | symbol>(pairs: Iterable<[K, T]> | ArrayLike<[K, T]>): Record<K ,T> {
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

export const VALID = 'VALID';
export const INVALID = 'INVALID';
export const PENDING = 'PENDING';
export const DISABLED = 'DISABLED';

function _find(control: AbstractTypedControl, path: Array<string | number> | string, delimiter: string) {
  if (path == null) return null;

  if (!(path instanceof Array)) {
    path = path.split('.');
  }

  if (path.length === 0) return null;

  return path.reduce((v: AbstractTypedControl, name) => {
    if (v instanceof TypedFormArray) {
      return v.at(name as number) || null;
    }

    if (v instanceof TypedFormDictionary) {
      return v.controls.has(name as string) ? v.controls.get(name as string) : null;
    }

    if (v instanceof TypedFormGroup) {
      return v.controls.hasOwnProperty(name as string) ? v.controls[name] : null;
    }

    return null;
  }, control);
}

export type FormHooks = 'change' | 'blur' | 'submit';

export abstract class AbstractTypedControl {
  private _parent: TypedFormArray<any> | TypedFormDictionary<any> | TypedFormGroup<any> | null = null;

  constructor(public _ctrl: AbstractControl) {}

  abstract get ng(): AbstractControl;

  get validator(): ValidatorFn | null { return this._ctrl.validator; }
  get asyncValidator(): AsyncValidatorFn | null { return this._ctrl.asyncValidator; }
  get value(): any { return this._ctrl.value; }
  get parent(): TypedFormArray<any> | TypedFormDictionary<any> | TypedFormGroup<any> | null { return this._parent; }
  get status(): string { return this._ctrl.status; }
  get valid(): boolean { return this.status === VALID; }
  get invalid(): boolean { return this.status === INVALID; }
  get pending(): boolean { return this.status == PENDING; }
  get disabled(): boolean { return this.status === DISABLED; }
  get enabled(): boolean { return this.status !== DISABLED; }
  get errors(): ValidationErrors | null { return this._ctrl.errors; }
  get pristine(): boolean { return this._ctrl.pristine; }
  get dirty(): boolean { return !this.pristine; }
  get touched(): boolean { return this._ctrl.touched; }
  get untouched(): boolean { return !this.touched; }
  get valueChanges(): Observable<any> { return this._ctrl.valueChanges; }
  get statusChanges(): Observable<any> { return this._ctrl.statusChanges; }
  get updateOn(): FormHooks { return this._ctrl.updateOn; }
  setValidators(newValidator: ValidatorFn | ValidatorFn[] | null): void { this._ctrl.setValidators(newValidator); }
  setAsyncValidators(newValidator: AsyncValidatorFn | AsyncValidatorFn[] | null): void { this._ctrl.setAsyncValidators(newValidator); }
  clearValidators(): void { this._ctrl.clearValidators(); }
  clearAsyncValidators(): void { this._ctrl.clearAsyncValidators(); }
  markAsTouched(opts: { onlySelf?: boolean } = {}): void { this._ctrl.markAsTouched(opts); }
  // markAllAsTouched(): void { this._ctrl.markAllAsTouched(); }
  markAsUntouched(opts: { onlySelf?: boolean } = {}): void { this._ctrl.markAsUntouched(opts); }
  markAsDirty(opts: { onlySelf?: boolean } = {}): void { this._ctrl.markAsDirty(opts); }
  markAsPristine(opts: { onlySelf?: boolean } = {}): void { this._ctrl.markAsPristine(opts); }
  markAsPending(opts: { onlySelf?: boolean, emitEvent?: boolean } = {}): void { this._ctrl.markAsPending(opts); }
  disable(opts: { onlySelf?: boolean, emitEvent?: boolean } = {}): void { this._ctrl.disable(opts); }
  enable(opts: { onlySelf?: boolean, emitEvent?: boolean } = {}): void { this._ctrl.enable(opts); }

  setParent(parent: TypedFormArray<any> | TypedFormDictionary<any> | TypedFormGroup<any> | null): void {
    this._parent = parent;
    this._ctrl.setParent(parent ? parent._ctrl as any : null);
  }

  abstract setValue(value: any, options?: Object): void;
  abstract patchValue(value: any, options?: Object): void;
  abstract reset(value?: any, options?: Object): void;

  updateValueAndValidity(opts: { onlySelf?: boolean, emitEvent?: boolean } = {}): void { this._ctrl.updateValueAndValidity(opts); }
  setErrors(errors: ValidationErrors | null, opts: { emitEvent?: boolean } = {}): void { this._ctrl.setErrors(errors, opts); }

  get(path: Array<string | number> | string): AbstractTypedControl | null {
    return _find(this, path, '.');
  }

  getError(errorCode: string, path?: string[]): any { return this._ctrl.getError(errorCode, path); }
  hasError(errorCode: string, path?: string[]): boolean { return this._ctrl.hasError(errorCode, path); }

  get root(): AbstractTypedControl {
    let x: AbstractTypedControl = this;

    while (x._parent) x = x._parent;

    return x;
  }
}

export class TypedFormArray<T extends AbstractTypedControl> extends AbstractTypedControl {
  public _controls: T[];

  constructor(
    controls: T[],
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    const ctrl = new FormArray(controls.map(ctrl => ctrl._ctrl), validatorOrOpts, asyncValidator);
    super(ctrl);
    this._controls = controls;
  }

  get controls(): T[] {
    return this._controls;
  }

  get ng(): FormArray { return this._ctrl as FormArray; }

  get value(): ValueType<T>[] { return this.ng.value; }
  get valueChanges(): Observable<ValueType<T>[]> { return this.ng.valueChanges; }

  at(index: number): T { return this.controls[index]; }

  push(control: T): void {
    this._controls.push(control);
    control.setParent(this);

    this.ng.push(control._ctrl);
  }

  insert(index: number, control: T): void {
    this._controls.splice(index, 0, control);
    control.setParent(this);

    this.ng.insert(index, control._ctrl);
  }

  removeAt(index: number): void {
    const deletedControls = this._controls.splice(index, 1);
    deletedControls.forEach(deletedControl => {
      deletedControl.setParent(null);
    });

    this.ng.removeAt(index);
  }

  setControl(index: number, control: T): void {
    const deletedControls = this._controls.splice(index, 1);
    deletedControls.forEach(deletedControl => {
      deletedControl.setParent(null);
    });

    if (control) {
      this._controls.splice(index, 0, control);
      control.setParent(this);
    }

    this.ng.setControl(index, control._ctrl);
  }

  get length(): number { return this.controls.length; }
  setValue(value: ValueType<T>[], options: { onlySelf?: boolean, emitEvent?: boolean } = {}): void { this.ng.setValue(value, options); }
  patchValue(value: ValueType<T>[], options: { onlySelf?: boolean, emitEvent?: boolean } = {}): void { this.ng.patchValue(value, options); }
  reset(value: ValueType<T>[] = [], options: { onlySelf?: boolean, emitEvent?: boolean } = {}): void { this.ng.reset(value, options); }
  getRawValue(): ValueType<T>[] { return this.ng.getRawValue(); }
}

export class TypedFormControl<T> extends AbstractTypedControl {
  constructor(
    formState: T | null = null,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    const ctrl = new FormControl(formState, validatorOrOpts, asyncValidator);
    super(ctrl);
    this._ctrl = ctrl;
  }

  get ng(): FormControl { return this._ctrl as FormControl; }

  get value(): T { return this.ng.value; }
  get valueChanges(): Observable<T> { return this.ng.valueChanges; }

  setValue(
    value: T,
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
    value: T,
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
  private _controls: Record<string, T>;

  constructor(
    controls: Record<string, NotUnion<T>>,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    const ctrl = new FormGroup(
      fromEntries(Object.entries(controls).map(([key, ctrl]) => [key, ctrl._ctrl] as [string, AbstractControl])),
      validatorOrOpts,
      asyncValidator
    );
    super(ctrl);
    this._controls = controls;
  }

  get controls(): Record<string, T> {
    return this._controls;
  }

  get ng(): FormGroup { return this._ctrl as FormGroup; }

  get value(): Record<string, ValueType<T>> { return this.ng.value; }
  get valueChanges(): Observable<Record<string, ValueType<T>>> { return this.ng.valueChanges; }

  registerControl(name: string, control: T): T {
    if (this._controls[name]) {
      return this._controls[name];
    }

    this._controls[name] = control;
    control.setParent(this);

    this.ng.registerControl(name, control._ctrl);
    return control;
  }

  addControl(name: string, control: T): void {
    if (!this._controls[name]) {
      this._controls[name] = control;
      control.setParent(this);
    }

    this.ng.addControl(name, control._ctrl);
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

    this.ng.setControl(name, control._ctrl);
  }

  contains(controlName: string): boolean { return this.ng.contains(controlName); }
  setValue(value: Record<string, ValueType<T>>, options: { onlySelf?: boolean, emitEvent?: boolean } = {}): void { this.ng.setValue(value, options); }
  patchValue(value: Partial<Record<string, ValueType<T>>>, options: { onlySelf?: boolean, emitEvent?: boolean } = {}): void { this.ng.patchValue(value, options); }
  reset(value: Partial<Record<string, ValueType<T>>> | {} = {}, options: { onlySelf?: boolean, emitEvent?: boolean } = {}): void { this.ng.reset(value, options); }
  getRawValue(): Record<string, ValueType<T>> { return this.ng.getRawValue(); }
}

export class TypedFormGroup<T extends { [P in keyof T]: T[P] extends AbstractTypedControl ? T[P] : never }> extends AbstractTypedControl {
  private _controls: T;

  constructor(
    controls: T,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    const ctrl = new FormGroup(
      fromEntries(Object.entries(controls).map(([key, ctrl]) => [key, (ctrl as AbstractTypedControl)._ctrl] as [string, AbstractControl])),
      validatorOrOpts,
      asyncValidator
    );
    super(ctrl);
    this._controls = controls;
  }

  get controls(): T {
    return this._controls;
  }

  get ng(): FormGroup { return this._ctrl as FormGroup; }

  get value(): ValueType<T> { return this.ng.value; }
  get valueChanges(): Observable<ValueType<T>> { return this.ng.valueChanges; }

  setControl<K extends keyof T, U extends T[K] & AbstractTypedControl>(name: K, control: U): void {
    delete (this._controls[name]);
    if (control) {
      this._controls[name] = control;
      control.setParent(this);
    }

    this.ng.setControl(name as string, control._ctrl);
  }

  contains(controlName: string): boolean { return this.ng.contains(controlName); }
  setValue(value: ValueType<T>, options: { onlySelf?: boolean, emitEvent?: boolean } = {}): void { this.ng.setValue(value, options); }
  patchValue(value: Partial<ValueType<T>>, options: { onlySelf?: boolean, emitEvent?: boolean } = {}): void { this.ng.patchValue(value, options); }
  reset(value: Partial<ValueType<T>> | {} = {}, options: { onlySelf?: boolean, emitEvent?: boolean } = {}): void { this.ng.reset(value, options); }
  getRawValue(): ValueType<T> { return this.ng.getRawValue(); }
}

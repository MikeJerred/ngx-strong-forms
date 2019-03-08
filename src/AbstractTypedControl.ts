import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';

import { TypedFormArray } from './TypedFormArray';
import { TypedFormDictionary } from './TypedFormDictionary';
import { TypedFormGroup } from './TypedFormGroup';

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

  getError(errorCode: string, path?: Array<string | number> | string): any { return this._ctrl.getError(errorCode, path); }
  hasError(errorCode: string, path?: Array<string | number> | string): boolean { return this._ctrl.hasError(errorCode, path); }

  get root(): AbstractTypedControl {
    let x: AbstractTypedControl = this;

    while (x._parent) x = x._parent;

    return x;
  }
}

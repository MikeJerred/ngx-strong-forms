import { AbstractControl, AbstractControlOptions, AsyncValidatorFn, FormGroup, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';

import { NotUnion, ValueType, fromEntries } from './utilities';
import { AbstractTypedControl } from './AbstractTypedControl';

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

import { AbstractControl, AbstractControlOptions, AsyncValidatorFn, FormGroup, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';

import { ValueType, fromEntries } from './utilities';
import { AbstractTypedControl } from './AbstractTypedControl';

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

import { AbstractControlOptions, AsyncValidatorFn, FormArray, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';

import { ValueType } from './utilities';
import { AbstractTypedControl } from './AbstractTypedControl';

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

import { AbstractControlOptions, AsyncValidatorFn, FormControl, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';

import { AbstractTypedControl } from './AbstractTypedControl';

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

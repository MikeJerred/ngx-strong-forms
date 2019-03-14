# ngx-strong-forms

## Getting Started

## Installation Instructions
Install `ngx-strong-forms` from `npm`:
```bash
npm install ngx-strong-forms --save
```

## Usage
This library provides 4 different types of form control.

### TypedFormArray<T>
This uses the Angular `FormArray` under the hood. It represents an array of items with type `T`, items can be added and removed but they must all be of type `T`.

### TypedFormControl<T>
This uses the Angular `FormControl` under the hood. It represents a single item of type `T`.

### TypedFormDictionary<T>
This uses the Angular `FormGroup` under the hood. It represents a dictionary of items of type `T` with a `string` key, items can be added and removed but they must all be of type `T`.

### TypedFormGroup<T>
This uses the Angular `FormGroup` under the hood. It represents a group of other form controls, once it is created items cannot be added or removed.

## Examples
```typescript
import { TypedFormControl, TypedFormGroup, TypedFormDictionary } from 'ngx-strong-forms';

const form = new TypedFormGroup({
  name: new TypedFormControl<string>(),
  details: new TypedFormGroup({
    size: new TypedFormControl<'small' | 'medium' | 'large'>(),
    weight: new TypedFormControl<number>()
  }),
  locations: new TypedFormDictionary({
    usa: new TypedFormGroup({
      count: new TypedFormControl<number>()
    }),
    japan: new TypedFormGroup({
      count: new TypedFormControl<number>()
    })
  })
});

form.controls.name.value // type is string

form.controls.details.weight.valueChanges // type is Observable<number>

form.value // type is:
// {
//   name: string,
//   details: {
//     size: 'small' | 'medium' | 'large',
//     weight: number
//   },
//   locations: {
//     [key: string]: {
//       count: number
//     }
//   }
// }

form.controls.locations.addControl('brazil', new TypedFormControl(0)); // error: argument must be of type TypedFormGroup<{ count: TypedFormControl<number> }>
```

To access the underlying Angular control, just use the `ng` property:
```html
<div [formGroup]="form.ng">
  <input type="text" formControlName="name">
  <ul>
    <li *ngFor="let location of form.get('locations').controls | keyvalue">
      <span>Name: {{location.key}}</span>
      <input type="number" [formControl]="location.value.controls.count.ng">
    </li>
  </ul>
</div>
```

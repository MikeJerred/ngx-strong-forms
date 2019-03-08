# ngx-strong-forms

## Getting Started

## Installation Instructions
Install `ngx-strong-forms` from `npm`:
```bash
npm install ngx-strong-forms --save
```

## Usage

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

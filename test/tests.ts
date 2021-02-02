import { TypedFormArray, TypedFormControl, TypedFormDictionary, TypedFormGroup } from '../src';

const c = new TypedFormControl('test');

c.valueChanges;
c.validator(c);

interface Person {
  name: TypedFormControl<string>;
  age: TypedFormControl<number>;
  children: TypedFormArray<TypedFormGroup<{ name: TypedFormControl<string> }>>;
}

const g = new TypedFormGroup<Person>({
  name: new TypedFormControl('paul'),
  age: new TypedFormControl(30),
  children: new TypedFormArray([])
});

g.value.name;
g.value.age;

g.value.children[2].name;

const d = new TypedFormDictionary({
  'paul': new TypedFormControl(30),
  'simon': new TypedFormControl(23)
});


d.value['paul'];



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

form.controls.details.controls.weight.valueChanges // type is Observable<number>

form.value;

form.controls.locations.addControl('brazil', new TypedFormGroup({ count: new TypedFormControl(0) }));
form.controls.locations.addControl('brazil', new TypedFormControl(0));


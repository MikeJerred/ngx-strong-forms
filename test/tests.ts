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

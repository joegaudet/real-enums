# real-enums

Simple Library for having enums that are actual classes and provide encapsulation of properties like icons / labels etc
for collections of enumerated values.

## Why does this exist

Well mostly for fun, but also to address the false polymorphism that is rampant in front end codebases. It's common to
see the following:

```handlebars
{{#if (eq order.state 'open')}}
    Open
{{else if (eq order.state 'closed')}}
    Closed
{{/if}}
```

Which instead can simply be something like the following:

```handlebars

<div class="{{order.state.className}}"/>
{{order.state.label}}
</div>
```

It can be particularly useful when making dropdowns etc

```handlebars
<select>
    {{#each OrderStates.values do |orderState|}}
        <option value="{{orderState.id}}">{{orderState.label}}</option>
    {{/each}}
</select>
```

# How to use it?

Install through npm

```
npm install --save real-enums
```

Simply import Enum, is, isNot and do the following:

```typescript
class TestEnum extends Enum {
    static TestA = new TestEnum('test-a');
    static TestB = new TestEnum('test-b');

    @is() declare isTestA: boolean;
    @isNot() declare isNotTestA: boolean;

    @is() declare isTestB: boolean;
    @isNot() declare isNotTestB: boolean;

    // An example of using a map
    get icon() {
        return {
            [TestEnum.TestA.value]: 'a',
            [TestEnum.TestB.value]: 'b'
        }[this.value];
    }

    // An example of using a colleciton
    get isReallyA() {
        return [TestEnum.TestA].includes(this)
    }
}
```

Caveat the is / isNot decorators are a bit of a trick and require property names to be exactly is<Name> isNot<Name>

## Ember.js

It was originally designed for the ember js data layer to allow back end enumerations such a something super common like
order
state to be transmitted to the front end as a string, below is a example transform.

```JavaScript

@classic
export default class AbstractEnumTransform extends Transform {
    enumClass;

    deserialize(serialized, { isArray = false } = {}) {
        // Convert arrays of values to arrays of enums
        if (isArray) {
            return serialized.map((serializedItem) =>
                this.enumClass.valueFor(serializedItem)
            );
        }

        // Otherwise, return a single enum
        return this.enumClass.valueFor(serialized);
    }

    serialize(deserialized, { isArray = false } = {}) {
        // Convert arrays of enums to arrays of values
        if (isArray) {
            return deserialized.map(
                (deserializedItem) => deserializedItem?.valueOf() ?? null
            );
        }

        // Otherwise, return a single value
        return deserialized?.valueOf() ?? null;
    }
}
```
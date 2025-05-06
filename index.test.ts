import { expect, test } from 'vitest'
import { Enum, is, isNot } from './index.js'

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

test('enumerating teh values of the enum', () => {
    expect(TestEnum.values).toEqual([TestEnum.TestA, TestEnum.TestB]);
});

test('enums have ids based on their value', () => {
    expect(TestEnum.values.map(e => e.id)).toEqual([TestEnum.TestA.id, TestEnum.TestB.id]);
});

test('enums have labels based on their capitalized value', () => {
    expect(TestEnum.values.map(e => e.label)).toEqual(['Test-a', 'Test-b']);
});

test('value for returns the correct value', () => {
    expect(TestEnum.valueFor('test-a')).toEqual(TestEnum.TestA);
    expect(TestEnum.valueFor('test-b')).toEqual(TestEnum.TestB);
});

test('decorators allow for simply interface to check for matches', () => {
    // Truth table of tautological states
    expect(TestEnum.TestA.isTestA).toBe(true);
    expect(TestEnum.TestA.isNotTestA).toBe(false);
    expect(TestEnum.TestA.isTestB).toBe(false);
    expect(TestEnum.TestA.isNotTestB).toBe(true);
    expect(TestEnum.TestB.isTestA).toBe(false);
    expect(TestEnum.TestB.isNotTestA).toBe(true);
    expect(TestEnum.TestB.isTestB).toBe(true);
    expect(TestEnum.TestB.isNotTestB).toBe(false);
});

test('type safety is observed', () => {
    const foos: TestEnum[] = TestEnum.values;
    foos.push(TestEnum.TestA);
    foos.push(TestEnum.TestB);
});

test('enums can be used as keys in maps', () => {
    expect(TestEnum.TestA.icon).toBe('a');
    expect(TestEnum.TestB.icon).toBe('b');
})

test('enums can be used as collecitons for inlcudes', () => {
    expect(TestEnum.TestA.isReallyA).toBe(true);
    expect(TestEnum.TestB.isReallyA).toBe(false);
})

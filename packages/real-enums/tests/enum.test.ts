import { expect, test } from 'vitest'
import { Enum, is, isNot, mapFields, realEnum } from '../src/index.js'

class TestEnum extends Enum {
  static TestA = new TestEnum('test-a')
  static TestB = new TestEnum('test-b')

  @is() accessor isTestA!: boolean
  @isNot() accessor isNotTestA!: boolean

  @is() accessor isTestB!: boolean
  @isNot() accessor isNotTestB!: boolean

  // An example of using a map
  get icon() {
    return {
      [TestEnum.TestA.value]: 'a',
      [TestEnum.TestB.value]: 'b',
    }[this.value]
  }

  // An example of using a colleciton
  get isReallyA() {
    return [TestEnum.TestA].includes(this)
  }
}

test('enumerating teh values of the enum', () => {
  expect(TestEnum.values).toEqual([TestEnum.TestA, TestEnum.TestB])
})

test('enums have ids based on their value', () => {
  expect(TestEnum.values.map(e => e.id)).toEqual([TestEnum.TestA.id, TestEnum.TestB.id])
})

test('enums have labels based on their capitalized value', () => {
  expect(TestEnum.values.map(e => e.label)).toEqual(['Test-a', 'Test-b'])
})

test('value for returns the correct value', () => {
  expect(TestEnum.valueFor('test-a')).toEqual(TestEnum.TestA)
  expect(TestEnum.valueFor('test-b')).toEqual(TestEnum.TestB)
})

test('decorators allow for simply interface to check for matches', () => {
  // Truth table of tautological states
  expect(TestEnum.TestA.isTestA).toBe(true)
  expect(TestEnum.TestA.isNotTestA).toBe(false)
  expect(TestEnum.TestA.isTestB).toBe(false)
  expect(TestEnum.TestA.isNotTestB).toBe(true)
  expect(TestEnum.TestB.isTestA).toBe(false)
  expect(TestEnum.TestB.isNotTestA).toBe(true)
  expect(TestEnum.TestB.isTestB).toBe(true)
  expect(TestEnum.TestB.isNotTestB).toBe(false)
})

test('type safety is observed', () => {
  const foos: TestEnum[] = TestEnum.values
  foos.push(TestEnum.TestA)
  foos.push(TestEnum.TestB)
})

test('enums can be used as keys in maps', () => {
  expect(TestEnum.TestA.icon).toBe('a')
  expect(TestEnum.TestB.icon).toBe('b')
})

test('enums can be used as collections for includes', () => {
  expect(TestEnum.TestA.isReallyA).toBe(true)
  expect(TestEnum.TestB.isReallyA).toBe(false)
})
class Status extends Enum {
  static Active = new Status('active')
  static OnHold = new Status('ON_hold')

  @is() accessor isActive!: boolean
}

test('labels capitalize the first letter and lower-case the rest', () => {
  expect(Status.OnHold.label).toBe('On_hold')
})

test('valueFor is typed to the subclass', () => {
  const active: Status | undefined = Status.valueFor('active')
  expect(active).toBe(Status.Active)
})

test('valueFor returns undefined for a value the enum does not have', () => {
  expect(Status.valueFor('archived')).toBeUndefined()
})

test('valueFor accepts an instance, so mapping twice is harmless', () => {
  expect(Status.valueFor(Status.Active)).toBe(Status.Active)
})

test('values only lists instances of the class itself', () => {
  expect(Status.values).toEqual([Status.Active, Status.OnHold])
})

test('JSON.stringify writes the raw value', () => {
  expect(JSON.stringify({ status: Status.Active, all: Status.values })).toBe(
    '{"status":"active","all":["active","ON_hold"]}',
  )
})

test('an @is() accessor with no matching static member throws instead of answering false', () => {
  class Typo extends Enum {
    static Open = new Typo('open')
    @is() accessor isOpne!: boolean
  }
  expect(() => Typo.Open.isOpne).toThrow(/Typo has no static member "Opne"/)
})

// Ember apps compile decorators with decorator-transforms, which implements Babel's legacy
// (stage 1) semantics: a field decorator is called with (prototype, key, descriptor) and the
// descriptor it returns is defined on the prototype. This is that call, by hand.
test('@is() and @isNot() also work as legacy field decorators, the way Ember compiles them', () => {
  class Legacy extends Enum {
    static Open = new Legacy('open')
    static Closed = new Legacy('closed')
    declare isOpen: boolean
    declare isNotOpen: boolean
  }
  const field = { configurable: true, enumerable: true, writable: true, initializer: undefined }
  const legacyIs = is() as unknown as (
    proto: object,
    key: string,
    desc: object,
  ) => PropertyDescriptor
  const legacyIsNot = isNot() as unknown as (
    proto: object,
    key: string,
    desc: object,
  ) => PropertyDescriptor
  Object.defineProperty(Legacy.prototype, 'isOpen', legacyIs(Legacy.prototype, 'isOpen', field))
  Object.defineProperty(
    Legacy.prototype,
    'isNotOpen',
    legacyIsNot(Legacy.prototype, 'isNotOpen', field),
  )

  expect(Legacy.Open.isOpen).toBe(true)
  expect(Legacy.Closed.isOpen).toBe(false)
  expect(Legacy.Closed.isNotOpen).toBe(true)
})

// The README's pitch is "an icon lives on the value"; an extra constructor argument is the
// obvious way to write that, and a private constructor the obvious way to close the set.
class Icon extends Enum {
  static Open = new Icon('open', '🟢')
  static Closed = new Icon('closed', '⚫')

  private constructor(
    value: string,
    readonly glyph: string,
  ) {
    super(value)
  }
}

test('enums with extra or private constructor arguments work everywhere a class is taken', () => {
  const open: Icon | undefined = Icon.valueFor('open')
  expect(open?.glyph).toBe('🟢')
  expect(Icon.codec().parse('closed')).toBe(Icon.Closed)
  expect(mapFields({ icon: 'open' }, { icon: Icon })).toEqual({ icon: Icon.Open })
  expect(realEnum(Icon)['~standard'].validate('closed')).toEqual({ value: Icon.Closed })
})

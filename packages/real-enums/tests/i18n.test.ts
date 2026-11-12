import { afterEach, expect, test } from 'vitest'

import { Enum, messagesFor, setTranslator, type Message, type Translator } from '../src/index.js'

class OrderState extends Enum {
  static i18n = 'orderState'

  static Pending = OrderState.of('pending')
  static Shipped = OrderState.of('shipped')
}

class LineStatus extends Enum {
  static i18n = 'lineStatus'

  static Pending = LineStatus.of('pending')
}

class Plain extends Enum {
  static Pending = Plain.of('pending')
}

// The contract's pseudo-locale: a string that skipped the translator shows up unwrapped.
function pseudo(): Translator & { calls: Message[] } {
  const calls: Message[] = []
  return {
    locale: 'en-XA',
    calls,
    t(message) {
      calls.push(message)
      return `⟦${message.message.replace(/[aeiou]/g, c => ({ a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' })[c]!)}⟧`
    },
  }
}

afterEach(() => setTranslator(undefined))

test('with no translator, label is the English derived from the value', () => {
  expect(OrderState.Pending.label).toBe('Pending')
})

test('with a translator, a keyed enum translates its label', () => {
  setTranslator(pseudo())
  expect(OrderState.values.map((s: OrderState) => s.label)).toEqual(['⟦Péndíng⟧', '⟦Shíppéd⟧'])
})

test('the translator gets the id <key>.<value>, the English msgid and the key as context', () => {
  const translator = pseudo()
  setTranslator(translator)
  void OrderState.Pending.label
  void LineStatus.Pending.label
  expect(translator.calls).toEqual([
    { id: 'orderState.pending', message: 'Pending', context: 'orderState' },
    { id: 'lineStatus.pending', message: 'Pending', context: 'lineStatus' },
  ])
})

test('an enum without a key keeps its English label and never calls the translator', () => {
  const translator = pseudo()
  setTranslator(translator)
  expect(Plain.Pending.label).toBe('Pending')
  expect(translator.calls).toEqual([])
})

test('a label the subclass overrides wins over the translator', () => {
  class Custom extends Enum {
    static i18n = 'custom'
    static A = Custom.of('a')
    override get label() {
      return 'Mine'
    }
  }
  setTranslator(pseudo())
  expect(Custom.A.label).toBe('Mine')
})

test('a subclass inherits its parent key', () => {
  class Special extends OrderState {
    static Lost = Special.of('lost')
  }
  setTranslator(pseudo())
  expect(Special.Lost.label).toBe('⟦Lóst⟧')
})

test('setTranslator(undefined) restores English', () => {
  setTranslator(pseudo())
  setTranslator(undefined)
  expect(OrderState.Pending.label).toBe('Pending')
})

test('messagesFor lists every member as a Message, in declaration order, in English', () => {
  setTranslator(pseudo())
  expect(messagesFor(OrderState)).toEqual([
    { id: 'orderState.pending', message: 'Pending', context: 'orderState' },
    { id: 'orderState.shipped', message: 'Shipped', context: 'orderState' },
  ])
})

test('messagesFor throws for an enum without a key, rather than leaving it out of the catalog', () => {
  expect(() => messagesFor(Plain)).toThrow('Plain has no static i18n key')
})

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'

import { resetApi } from './api'
import { App } from './App'

afterEach(() => {
  cleanup()
  resetApi()
})

const rows = async () => within(await screen.findByRole('list')).findAllByRole('listitem')
const text = (items: HTMLElement[]) => items.map(item => item.textContent)

test('each order shows its state label', async () => {
  render(<App />)
  await screen.findByRole('button', { name: 'Ship' })
  expect(text(await rows())).toEqual([
    '#1001 Ada LovelacePendingShip',
    '#1002 Grace HopperShippedDeliver',
    '#1003 Katherine JohnsonDelivered',
    '#1004 Alan TuringCancelled',
  ])
})

test('@is() predicates drive the markup: only the cancelled order is muted', async () => {
  render(<App />)
  const items = await rows()
  expect(items.map(item => item.className)).toEqual(['', '', '', 'muted'])
})

test('the filter is built from OrderState.values', async () => {
  render(<App />)
  await screen.findByRole('button', { name: 'Ship' })
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'delivered' } })
  expect(text(await rows())).toEqual(['#1003 Katherine JohnsonDelivered'])
})

test('advancing an order sends the raw value and shows the new state', async () => {
  render(<App />)
  fireEvent.click(await screen.findByRole('button', { name: 'Ship' }))
  await waitFor(async () =>
    expect(text(await rows())).toEqual([
      '#1001 Ada LovelaceShippedDeliver',
      '#1002 Grace HopperShippedDeliver',
      '#1003 Katherine JohnsonDelivered',
      '#1004 Alan TuringCancelled',
    ]),
  )
})

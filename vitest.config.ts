import { defineConfig } from 'vitest/config'

// One run covers every package's unit tests; examples run their own suites.
export default defineConfig({
  test: {
    projects: ['packages/*'],
  },
})

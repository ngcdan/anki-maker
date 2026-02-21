import { setupServer } from 'msw/node'
import { rest } from 'msw'
import { ankiService } from '../src/services/ankiService' // import from the correct src path
import { afterAll, afterEach, beforeAll, expect, it } from "vitest"

const server = setupServer(
  rest.post('http://127.0.0.1:8765', async (req, res, ctx) => { // setup a mock server
    const { action, params } = await req.json()
    if (action === 'deckNames') {
      return res(ctx.json({ result: ['deck1', 'deck2', 'deck3'] })) // return mock response for deckNames
    }
    if (action === 'modelNames') {
      return res(ctx.json({ result: ['model1', 'model2', 'model3'] })) // return mock response for modelNames
    }
    if (action === 'modelFieldNames' && params?.modelName === 'Basic') {
      return res(ctx.json({ result: ['field1', 'field2', 'field3'] })) // return mock response for modelFieldNames
    }
    return res(ctx.status(404))
  })
)

beforeAll(() => server.listen()) // start the server before all tests
afterEach(() => server.resetHandlers()) // reset handlers after each test
afterAll(() => server.close()) // close the server after all tests

it('fetches deck names correctly', async () => {
  const deckNames = await ankiService.fetchDecks()
  expect(deckNames).toEqual(['deck1', 'deck2', 'deck3'])
})

it('fetches model names correctly', async () => {
  const modelNames = await ankiService.fetchModels()
  expect(modelNames).toEqual(['model1', 'model2', 'model3'])
})

it('fetches model field names correctly for Basic model', async () => {
  const modelFieldNames = await ankiService.fetchModelFieldNames('Basic')
  expect(modelFieldNames).toEqual(['field1', 'field2', 'field3'])
})

it('properly handles network errors when fetching deck names', async () => {
  server.use(
    rest.post('http://127.0.0.1:8765', (_, res, ctx) => {
      return res(ctx.status(500))
    })
  )
  await expect(ankiService.fetchDecks()).rejects.toThrow('HTTP 500: Internal Server Error')
})

it('properly handles network errors when fetching model names', async () => {
  server.use(
    rest.post('http://127.0.0.1:8765', (_, res, ctx) => {
      return res(ctx.status(500))
    })
  )
  await expect(ankiService.fetchModels()).rejects.toThrow('HTTP 500: Internal Server Error')
})

it('properly handles network errors when fetching model field names', async () => {
  server.use(
    rest.post('http://127.0.0.1:8765', (_, res, ctx) => {
      return res(ctx.status(500))
    })
  )
  await expect(ankiService.fetchModelFieldNames('Basic')).rejects.toThrow('HTTP 500: Internal Server Error')
})

it('throws an error when the server returns an error message for deck names', async () => {
  server.use(
    rest.post('http://127.0.0.1:8765', async (req, res, ctx) => {
      await req.json().catch((e) => e);
      return res(ctx.json({ error: 'Server error' }))
    })
  )
  await expect(ankiService.fetchDecks()).rejects.toThrow('Server error')
})

it('throws an error when the server returns an error message for model names', async () => {
  server.use(
    rest.post('http://127.0.0.1:8765', async (req, res, ctx) => {
      await req.json().catch((e) => e);
      return res(ctx.json({ error: 'Server error' }))
    })
  )
  await expect(ankiService.fetchModels()).rejects.toThrow('Server error')
})

it('throws an error when the server returns an error message for model field names', async () => {
  server.use(
    rest.post('http://127.0.0.1:8765', async (req, res, ctx) => {
      await req.json().catch((e) => e);
      return res(ctx.json({ error: 'Server error' }))
    })
  )
  await expect(ankiService.fetchModelFieldNames('Basic')).rejects.toThrow('Server error')
})

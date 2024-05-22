import { expect, test } from 'vitest'
import { GET } from "api/hello";

test('GET Hello World', async () => {
  const response = await GET().text();
  expect(response).toBe("Hello, world!")
})

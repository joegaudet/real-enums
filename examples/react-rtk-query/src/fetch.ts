import { fetchOrders, updateOrder } from './api'

// Routes fetchBaseQuery's requests to the stand-in API, so the RTK Query setup below is the
// one a real app would use against a real server.
export async function fakeFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const request = new Request(input, init)
  const id = Number(new URL(request.url).pathname.split('/')[2])
  const body =
    request.method === 'PATCH' ? await updateOrder(id, await request.json()) : await fetchOrders()
  return Response.json(body)
}

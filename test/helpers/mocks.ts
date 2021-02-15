export function mockResponse (status: number, body: any, headers?: Headers): any {
  const init: ResponseInit = headers
    ? { status, headers }
    : { status }

  //the fetch API returns a resolved window Response object
  const bodyResponse = body instanceof Uint8Array ? body : JSON.stringify(body);
  const mockResponse = new Response(bodyResponse, init);

  return () => Promise.resolve(mockResponse);
}
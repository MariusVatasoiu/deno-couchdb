import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');

Deno.test("should be able to insert documents in bulk - POST /db/_bulk_docs - db.bulk", async () => {
  const docs = [{ a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 4 }];
  const response = [
    { ok: true, id: 'x', rev: '1-123' },
    { ok: true, id: 'y', rev: '1-456' },
    { ok: true, id: 'z', rev: '1-789' }
  ];
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.bulk({ docs: docs });

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');
  fetchStub.restore();
});

Deno.test("should be able to handle missing database - POST /db/_bulk_docs - db.bulk", async () => {
  const docs = [{ a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 4 }];
  const response = {
    error: 'not_found',
    reason: 'Database does not exist.'
  };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(404, response));
  
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.bulk({ docs: docs }), Error , "Database does not exist.");
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');
  fetchStub.restore();
});

import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');

Deno.test("should be able to destroy a document - DELETE /db/id - db.destroy", async () => {
  const response = { ok: true, id: 'id', rev: '2-456' };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.destroy('id', '1-123');

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'DELETE');
  fetchStub.restore();
});

Deno.test("should be able to handle 409 conflicts - DELETE /db/id - db.destroy", async () => {
  const response = {
    error: 'conflict',
    reason: 'Document update conflict.'
  };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(409, response));
  
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.destroy('id', '1-123'), Error , "Document update conflict.");
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'DELETE');
  fetchStub.restore();
});

Deno.test("should detect missing parameters - db.destroy", async () => {
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.destroy(undefined, '1-123'), Error , "Invalid parameters");
});

Deno.test("should detect missing parameters (callback) - db.destroy", () => {
  const db = nano.db.use('db');
  return new Promise((resolve, reject) => {
    db.destroy(undefined, undefined, (err: any, data: any) => {
      assertNotEquals(err === null && typeof err === "object", true);
      resolve();
    });
  });
});

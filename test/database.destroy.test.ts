import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');
const response = { ok: true }

Deno.test("should destroy a database - DELETE /db - nano.db.destroy", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const p = await nano.db.destroy('db');
  try{
    assertEquals(typeof p, 'object');
    assertEquals(p.ok, true);
    const fetchArg = <Request>fetchStub.calls[0].args[0];
    assertEquals(fetchArg.method, 'DELETE');
  } finally {
    fetchStub.restore();
  }
});

Deno.test("should handle non-existant database - DELETE /db - nano.db.destroy", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(404, {
    error: 'not_found',
    reason: 'Database does not exist.'
  }));
  
  assertThrowsAsync(async() => await nano.db.destroy('db'), Error , "Database does not exist");
  const fetchArg = <Request>fetchStub.calls[0].args[0];
    assertEquals(fetchArg.method, 'DELETE');

  fetchStub.restore();
});

Deno.test("should not attempt to destroy database with empty database name - nano.db.destroy", async () => {
  assertThrowsAsync(async() => await nano.db.destroy(), Error , "Invalid parameters");
  assertThrowsAsync(async() => await nano.db.destroy(''), Error , "Invalid parameters");
});

Deno.test("should detect missing parameters (callback) - nano.db.destroy", () => {
  return new Promise((resolve, reject) => {
    nano.db.destroy(undefined, (err: any, data: any) => {
      assertNotEquals(err === null && typeof err === "object", true);
      resolve();
    });
  });
});
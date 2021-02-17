import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');
const response = { ok: true, id: 'rep1', rev: '2-123' };
const errResponse = {
  error: 'not_found',
  reason: 'missing'
};

Deno.test("should be able to delete a replication - DELETE /_replicator/id - nano.db.replication.disable", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const p = await nano.db.replication.disable('rep1', '1-456');
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  try{
    assertEquals(p, response);
    assertEquals(fetchArg.method, 'DELETE');
  } finally {
    fetchStub.restore();
  }
});

Deno.test("should be able to handle a 404 - DELETE /_replicator/id - nano.db.replication.disable", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(404, errResponse));
  
  assertThrowsAsync(async() => await nano.db.replication.disable('rep1', '1-456'), Error , "missing");
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'DELETE');

  fetchStub.restore();
});

Deno.test("should not to try to disable with invalid parameters - nano.db.replication.disable", async () => {
  assertThrowsAsync(async() => await nano.db.replication.disable(undefined, '1-456'), Error , "Invalid parameters");
  assertThrowsAsync(async() => await nano.db.replication.disable('', '1-456'), Error , "Invalid parameters");
  assertThrowsAsync(async() => await nano.db.replication.disable('rep1'), Error , "Invalid parameters");
});

Deno.test("should detect missing parameters (callback) - nano.db.replication.disable", () => {
  return new Promise((resolve, reject) => {
    nano.db.replication.disable(undefined, undefined, (err: any, data: any) => {
      assertNotEquals(err === null && typeof err === "object", true);
      resolve();
    });
  });
});

Deno.test("should be able to delete a replication from db.replication.disable - DELETE /_replicator/id - db.replication.disable", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));

  const db = nano.db.use('db');
  const p = await db.replication.disable('rep1', '1-456');

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'DELETE');

  fetchStub.restore();
});
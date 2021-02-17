import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');
const response = {
  results: [
    {
      seq: '1-nC1J',
      id: 'c42ddf1272c7d05b2dc45b6962000b10',
      changes: [
        {
          rev: '1-23202479633c2b380f79507a776743d5'
        }
      ]
    }
  ],
  last_seq: '1-C1J',
  pending: 0
}
const errResponse = {
  error: 'not_found',
  reason: 'Database does not exist.'
}

Deno.test("should be able to fetch the changes - GET /db/_changes - nano.db.changes", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));

  const p = await nano.db.changes('db');
  
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'GET');
  assertEquals(p, response);

  fetchStub.restore();
});

Deno.test("should be able to fetch the changes with opts - GET /db/_changes - nano.db.changes", async () => {
  const opts = { include_docs: true, feed: 'continuous' }
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));

  const p = await nano.db.changes('db', opts);
  
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'GET');
  assertEquals(p, response);

  fetchStub.restore();
});

Deno.test("should be able to handle a missing database - GET /db/_changes - nano.db.changes", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(404, errResponse));
  
  
  assertThrowsAsync(async() => await nano.db.changes('db'), Error , "Database does not exist");
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'GET');

  fetchStub.restore();
});

Deno.test("should not attempt invalid parameters - nano.db.changes", async () => {
  
  assertThrowsAsync(async() => await nano.db.changes(), Error , "Invalid parameters");
  assertThrowsAsync(async() => await nano.db.changes(''), Error , "Invalid parameters");
});

Deno.test("should detect missing parameters (callback) - nano.db.changes", async () => {
  return new Promise((resolve, reject) => {
    nano.db.changes(undefined, undefined, (err: any, data: any) => {
      assertNotEquals(err === null && typeof err === "object", true);
      resolve();
    });
  });
});

Deno.test("should be able to fetch the changes from db.changes - GET /db/_changes - db.changes", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.changes();
  assertEquals(p, response);
  fetchStub.restore();
});

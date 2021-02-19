import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');

Deno.test("should be able to create an index - POST /db/_index - db.createIndex", async () => {
  const indexDef = {
    index: {
      fields: ['town', 'surname']
    },
    type: 'json',
    name: 'townsurnameindex',
    partitioned: false
  };
  const response = {
    result: 'created',
    id: '_design/a5f4711fc9448864a13c81dc71e660b524d7410c',
    name: 'foo-index'
  };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.createIndex(indexDef);

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');
  fetchStub.restore();
});

Deno.test("should handle 404 - POST /db/_index - db.createIndex", async () => {
  const indexDef = {
    index: {
      fields: ['town', 'surname']
    },
    type: 'json',
    name: 'townsurnameindex',
    partitioned: false
  };
  const response = {
    error: 'not_found',
    reason: 'missing'
  };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(404, response));
  
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.createIndex(indexDef), Error , "missing");
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');
  fetchStub.restore();
});

Deno.test("should detect missing index - db.createIndex", async () => {
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.createIndex(), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.createIndex('myindex'), Error , "Invalid parameters");
});

Deno.test("should detect missing index (callback) - db.createIndex", () => {
  const db = nano.db.use('db');
  return new Promise((resolve, reject) => {
    db.createIndex('', (err: any, data: any) => {
      assertNotEquals(err === null && typeof err === "object", true);
      resolve();
    });
  });
});

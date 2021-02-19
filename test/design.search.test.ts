import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');

Deno.test("should be able to access a search index - POST /db/_design/ddoc/_search/searchname - db.search", async () => {
  const response = {
    total_rows: 100000,
    bookmark: 'g123',
    rows: [
      { a: 1, b: 2 }
    ]
  };
  const params = { q: '*:*' };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.search('ddoc', 'searchname', params);

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');
  fetchStub.restore();
});

Deno.test("should be able to handle 404 - db.search", async () => {
  const response = {
    error: 'not_found',
    reason: 'missing'
  };
  const params = { q: '*:*' };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(404, response));
  
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.search('ddoc', 'searchname', params), Error , "missing");
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');
  fetchStub.restore();
});

Deno.test("should detect missing parameters - db.search", async () => {
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.search(), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.search('susan'), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.search('susan', ''), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.search('', 'susan'), Error , "Invalid parameters");
});

Deno.test("should detect missing parameters (callback) - db.search", () => {
  const db = nano.db.use('db');
  return new Promise((resolve, reject) => {
    db.search('', '', (err: any, data: any) => {
      assertNotEquals(err === null && typeof err === "object", true);
      resolve();
    });
  });
});

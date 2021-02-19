import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');

Deno.test("should be able to use a show function - GET /db/_design/ddoc/_show/showname/docid - db.show", async () => {
  const showFunction = function (doc?: any, req?: any) {
    return 'Hello, world!'
  };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, showFunction(), new Headers({ 'Content-type': 'text/plain' })));
  
  const db = nano.db.use('db');
  const p = await db.show('ddoc', 'showname', 'docid');

  assertEquals(p, showFunction());
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'GET');
  fetchStub.restore();
});

Deno.test("should be able to handle 404 - db.show", async () => {
  const response = {
    error: 'not_found',
    reason: 'missing'
  };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(404, response));
  
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.show('ddoc', 'showname', 'docid'), Error , "missing");
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'GET');
  fetchStub.restore();
});

Deno.test("should detect missing parameters - db.show", async () => {
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.show(), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.show('ddoc'), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.show('ddoc', 'showname'), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.show('', 'showname', 'docid'), Error , "Invalid parameters");
});

Deno.test("should detect missing parameters (callback) - db.show", () => {
  const db = nano.db.use('db');
  return new Promise((resolve, reject) => {
    db.show('', '', '', {}, (err: any, data: any) => {
      assertNotEquals(err === null && typeof err === "object", true);
      resolve();
    });
  });
});

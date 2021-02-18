import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');

Deno.test("should be able to use an update function - PUT /db/_design/ddoc/_update/updatename/docid - db.atomic", async () => {
  const updateFunction = function (doc: any, req?: any) {
    if (doc) {
      doc.ts = new Date().getTime();
    }
    return [doc, { json: { status: 'ok' } }];
  };
  const response = updateFunction({})[1].json;
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.atomic('ddoc', 'updatename', 'docid');

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'PUT');
  fetchStub.restore();
});

Deno.test("should be able to use an update function with body - PUT /db/_design/ddoc/_update/updatename/docid - db.atomic", async () => {
  const updateFunction = function (doc: any, req?: any) {
    if (doc) {
      doc.ts = new Date().getTime();
    }
    return [doc, { json: { status: 'ok' } }];
  };
  const body = { a: 1, b: 2 };
  const response = updateFunction({})[1].json;
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.atomic('ddoc', 'updatename', 'docid', body);
  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'PUT');
  fetchStub.restore();
});

Deno.test("should be able to handle 404 - db.atomic", async () => {
  const response = {
    error: 'not_found',
    reason: 'missing'
  };
  const body = { a: 1, b: 2 };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(404, response));
  
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.atomic('ddoc', 'updatename', 'docid', body), Error , "missing");
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'PUT');
  fetchStub.restore();
});

Deno.test("should detect missing parameters - db.update", async () => {
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.atomic(), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.atomic('ddoc'), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.atomic('ddoc', 'updatename'), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.atomic('', 'updatename', 'docid'), Error , "Invalid parameters");
});

Deno.test("should detect missing parameters (callback) - db.update", () => {
  const db = nano.db.use('db');
  return new Promise((resolve, reject) => {
    db.atomic('', '', '', {}, (err: any, data: any) => {
      assertNotEquals(err === null && typeof err === "object", true);
      resolve();
    });
  });
});

Deno.test("should detect missing parameters (callback no body) - db.update", () => {
  const db = nano.db.use('db');
  return new Promise((resolve, reject) => {
    db.atomic('', '', '', (err: any, data: any) => {
      assertNotEquals(err === null && typeof err === "object", true);
      resolve();
    });
  });
});
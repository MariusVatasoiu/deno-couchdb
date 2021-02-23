import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');

Deno.test("should be able to fetch a list of documents - POST /db/_all_docs - db.fetch", async () => {
  const response = { _id: 'id', rev: '1-123', a: 1, b: 'two', c: true };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.get('id');

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'GET');
  fetchStub.restore();
});

Deno.test("should be able to get a document from a partition - GET /db/pkey:id - db.get", async () => {
  const response = { _id: 'partkey:id', rev: '1-123', a: 1, b: 'two', c: true };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.get('partkey:id');

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'GET');
  fetchStub.restore();
});

Deno.test("should be able to get a document with options - GET /db/id?conflicts=true - db.get", async () => {
  const response = { _id: 'id', rev: '1-123', a: 1, b: 'two', c: true };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.get('id', { conflicts: true });

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'GET');
  fetchStub.restore();
});

Deno.test("should be able to handle 404 - GET /db/id - db.get", async () => {
  const response = {
    error: 'not_found',
    reason: 'missing'
  };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(404, response));
  
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.get('id'), Error , "missing");
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'GET');
  fetchStub.restore();
});

Deno.test("should detect missing doc id - db.get", async () => {
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.get(), Error , "Invalid parameters");
});

Deno.test("should detect missing parameters (callback) - db.get", () => {
  return new Promise((resolve, reject) => {
    const db = nano.db.use('db');
    db.get(undefined, undefined, (err: any, data: any) => {
      assertNotEquals(err === null && typeof err === "object", true);
      resolve();
    });
  });
});

Deno.test("check request can fetch local documents - db.get", async () => {
  const response = { _id: '_local/id', _rev: '1-123', a: 1 };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.get('_local/id');

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'GET');
  fetchStub.restore();
});
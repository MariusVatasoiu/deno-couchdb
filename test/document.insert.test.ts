import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');

Deno.test("should be able to insert document - POST /db - db.insert", async () => {
  const doc = { a: 1, b: 2 };
  const response = { ok: true, id: '8s8g8h8h9', rev: '1-123' };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.insert(doc);

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');
  fetchStub.restore();
});

Deno.test("should be able to insert document with opts - POST /db?batch=ok - db.insert", async () => {
  const doc = { a: 1, b: 2 };
  const response = { ok: true, id: '8s8g8h8h9', rev: '1-123' };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.insert(doc, { batch: 'ok' });

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');
  fetchStub.restore();
});

Deno.test("should be able to insert document with known id - PUT /db/id - db.insert", async () => {
  const doc = { a: 1, b: 2 };
  const response = { ok: true, id: 'myid', rev: '1-123' };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.insert(doc, 'myid');

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'PUT');
  fetchStub.restore();
});

Deno.test("should be able to insert document with id in object - POST /db - db.insert", async () => {
  const doc = { _id: 'myid', a: 1, b: 2 };
  const response = { ok: true, id: 'myid', rev: '1-123' };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.insert(doc);

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');
  fetchStub.restore();
});

Deno.test("should be able to update document with id/rev in object - POST /db - db.insert", async () => {
  const doc = { _id: 'myid', _rev: '1-123', a: 2, b: 2 };
  const response = { ok: true, id: 'myid', rev: '2-456' };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.insert(doc);

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');
  fetchStub.restore();
});

Deno.test("should be able to handle 409 conflicts - POST /db - db.insert", async () => {
  const doc = { _id: 'myid', _rev: '1-123', a: 2, b: 2 };
  const response = {
    error: 'conflict',
    reason: 'Document update conflict.'
  };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(409, response));
  
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.insert(doc), Error , "Document update conflict.");
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');
  fetchStub.restore();
});

Deno.test("should be able to handle missing database - POST /db - db.insert", async () => {
  const doc = { a: 1, b: 2 };
  const response = {
    error: 'not_found',
    reason: 'Database does not exist.'
  };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(404, response));
  
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.insert(doc), Error , "Database does not exist.");
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');
  fetchStub.restore();
});

Deno.test("should be able to insert document with _local id - PUT /db/_local/id - db.insert", async () => {
  const doc = { a: 1, b: 2 };
  const response = { ok: true, id: '_local/myid', rev: '1-123' };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.insert(doc, '_local/myid');

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'PUT');
  fetchStub.restore();
});

Deno.test("should be able to insert document with local id in object - POST /db - db.insert", async () => {
  const doc = { _id: '_local/myid', a: 1, b: 2 };
  const response = { ok: true, id: '_local/myid', rev: '1-123' };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.insert(doc);

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');
  fetchStub.restore();
});
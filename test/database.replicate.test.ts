import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');
const response = {
  history: [],
  ok: true,
  replication_id_version: 3,
  session_id: '142a35854a08e205c47174d91b1f9628',
  source_last_seq: 28
};

Deno.test("should be able to send replication request with local database names - POST /_replicate - nano.db.replicate", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const p = await nano.db.replicate('source', 'target');
  try{
    assertEquals(p, response);
    const fetchArg = <Request>fetchStub.calls[0].args[0];
    assertEquals(fetchArg.method, 'POST');
  } finally {
    fetchStub.restore();
  }
});

Deno.test("should be able to send replication request with URLs - POST /_replicate - nano.db.replicate", async () => {
  const source = 'http://mydomain1.com/source'
  const target = 'https://mydomain2.com/target'
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));

  const p = await nano.db.replicate(source, target);

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');

  fetchStub.restore();
});

Deno.test("should be able to supply additional parameters - POST /_replicate - nano.db.replicate", async () => {
  const source = 'http://mydomain1.com/source'
  const target = 'https://mydomain2.com/target'
  const opts = { filter: 'ddoc/func', continuous: true }
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));

  const p = await nano.db.replicate(source, target, opts);

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');

  fetchStub.restore();
});

Deno.test("should not attempt compact invalid parameters - nano.db.replicate", async () => {
  assertThrowsAsync(async() => await nano.db.replicate(''), Error , "Invalid parameters");
  assertThrowsAsync(async() => await nano.db.replicate(undefined, 'target'), Error , "Invalid parameters");
  assertThrowsAsync(async() => await nano.db.replicate('', 'target'), Error , "Invalid parameters");
});

Deno.test("should not attempt compact invalid parameters - nano.db.replicate", async () => {
  assertThrowsAsync(async() => await nano.db.replicate(''), Error , "Invalid parameters");
  assertThrowsAsync(async() => await nano.db.replicate(undefined, 'target'), Error , "Invalid parameters");
  assertThrowsAsync(async() => await nano.db.replicate('', 'target'), Error , "Invalid parameters");
});

Deno.test("should detect missing parameters (callback) - nano.db.replicate", () => {
  return new Promise((resolve, reject) => {
    nano.db.replicate(undefined, undefined, undefined, (err: any, data: any) => {
      assertNotEquals(err === null && typeof err === "object", true);
      resolve();
    });
  });
});

Deno.test("should be replicate from db.replicate - POST /_replicate - db.replicate", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));

  const db = nano.db.use('source')
  const p = await db.replicate('target')

  assertEquals(p, response);
  const fetchArg = <Request>fetchStub.calls[0].args[0];
  assertEquals(fetchArg.method, 'POST');

  fetchStub.restore();
});
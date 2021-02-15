import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib2/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');
const response = { ok: true };

Deno.test("should be able to send compaction request - POST /db/_compact - nano.db.compact", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const p = await nano.db.compact('db')
  try{
    assertEquals(p, response);
    const fetchArg = <Request>fetchStub.calls[0].args[0];
    assertEquals(fetchArg.method, 'POST');
  } finally {
    fetchStub.restore();
  }
});

Deno.test("should be able to send compaction request with design doc - POST /db/_compact/ddoc - nano.db.compact", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const p = await nano.db.compact('db', 'ddoc')
  try{
    assertEquals(p, response);
    const fetchArg = <Request>fetchStub.calls[0].args[0];
    assertEquals(fetchArg.method, 'POST');
  } finally {
    fetchStub.restore();
  }
});

Deno.test("should not attempt compact with invalid parameters - nano.db.compact", async () => {
  assertThrowsAsync(async() => await nano.db.compact(''), Error , "Invalid parameters");
  assertThrowsAsync(async() => await nano.db.compact(), Error , "Invalid parameters");
});

Deno.test("should detect missing parameters (callback) - nano.db.compact", () => {
  return new Promise((resolve, reject) => {
    nano.db.compact(undefined, (err: any, data: any) => {
      assertNotEquals(err === null && typeof err === "object", true);
      resolve();
    });
  });
});

Deno.test("should be able to send compaction request from db.compact - POST /db/_compact - db.compact", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.compact()
  try{
    assertEquals(p, response);
    const fetchArg = <Request>fetchStub.calls[0].args[0];
    assertEquals(fetchArg.method, 'POST');
  } finally {
    fetchStub.restore();
  }
});

Deno.test("should be able to send compaction request with design doc from db.view.compact - POST /db/_compact/ddoc - db.view.compact", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const db = nano.db.use('db');
  const p = await db.view.compact('ddoc');
  try{
    assertEquals(p, response);
    const fetchArg = <Request>fetchStub.calls[0].args[0];
    assertEquals(fetchArg.method, 'POST');
  } finally {
    fetchStub.restore();
  }
});
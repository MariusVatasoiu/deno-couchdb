import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib2/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');
const response = { ok: true }

Deno.test("should create a database - PUT /db - nano.db.create", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  
  const p = await nano.db.create('db');
  try{
    assertEquals(typeof p, 'object');
    assertEquals(p.ok, true);
    const fetchArg = <Request>fetchStub.calls[0].args[0];
    assertEquals(fetchArg.method, 'PUT');
  } finally {
    fetchStub.restore();
  }
});

Deno.test("should handle pre-existing database - PUT /db - nano.db.create", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(412, {
    error: 'file_exists',
    reason: 'The database could not be created, the file already exists.'
  }));
  
  assertThrowsAsync(async() => await nano.db.create('db'), Error , "The database could not be created");

  fetchStub.restore();
});

Deno.test("should not attempt to create database with invalid parameters - nano.db.create", async () => {
  assertThrowsAsync(async() => await nano.db.create(), Error , "Invalid parameters");
  assertThrowsAsync(async() => await nano.db.create(''), Error , "Invalid parameters");
});

Deno.test("should detect missing parameters (callback) - nano.db.create", () => {
  return new Promise((resolve, reject) => {
    nano.db.create(undefined, undefined, (err: any, data: any) => {
      assertNotEquals(err === null && typeof err === "object", true);
      resolve();
    });
  });
});
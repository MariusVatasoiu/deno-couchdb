import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib2/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');


Deno.test("should be able to destroy an attachment - DELETE /db/id/attname - db.attachment.destroy", async () => {
  const response = { ok: true, id: 'id', rev: '2-456' };
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  const db = nano.db.use('db');
  const p = await db.attachment.destroy('id', 'logo.jpg', { rev: '1-123' });

  try{
    assertEquals(p, response);
  } finally {
    fetchStub.restore();
  }
});

Deno.test("should be able to destroy an attachment - DELETE /db/id/attname - db.attachment.destroyshould be able to handle 409 conflicts - DELETE /db/id/attname- db.attachment.destroy", async () => {
  const response = {
    error: 'conflict',
    reason: 'Document update conflict.'
  }
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(409, response));
  const db = nano.db.use('db');

  try{
    assertThrowsAsync(async() => await db.attachment.destroy('id', 'logo.jpg', { rev: '1-123' }), Error , "Document update conflict.");
  } finally {
    fetchStub.restore();
  }
});

Deno.test("should detect missing doc id - db.attachment.destroy", async () => {
  const db = nano.db.use('db');

  assertThrowsAsync(async() => await db.attachment.destroy(), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.attachment.destroy('id'), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.attachment.destroy('id', ''), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.attachment.destroy('', 'logo.jpg'), Error , "Invalid parameters");
});

Deno.test("should detect missing parameters (callback) - db.attachment.destroy", () => {
  const db = nano.db.use('db');

  return new Promise((resolve, reject) => {
    db.attachment.destroy(undefined, undefined, undefined, (err: any, data: any) => {
      assertNotEquals(err === null && typeof err === "object", true);
      resolve();
    });
  });
});
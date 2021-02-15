import { assertEquals, assertNotEquals, assertThrowsAsync } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');
const image = Uint8Array.from(atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"), c => c.charCodeAt(0));

Deno.test("should be able to get an attachment - GET /db/id/attname - db.attachment.get", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, image, new Headers({ 'content-type': 'image/gif' })));
  const db = nano.db.use('db');
  const p = await db.attachment.get('id', 'transparent.gif');
  try{
    assertEquals(p, image);
  } finally {
    fetchStub.restore();
  }
});

Deno.test("should be able to get an attachment with opts - GET /db/id/attname - db.attachment.get", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, image, new Headers({ 'content-type': 'image/gif' })));
  const db = nano.db.use('db');
  const p = await db.attachment.get('id', 'transparent.gif', { r: 1 });
  try{
    assertEquals(p, image);
  } finally {
    fetchStub.restore();
  }
});

Deno.test("should detect missing parameters - db.attachment.get", async () => {
  const db = nano.db.use('db');
  assertThrowsAsync(async() => await db.attachment.get(), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.attachment.get('id'), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.attachment.get('id', ''), Error , "Invalid parameters");
  assertThrowsAsync(async() => await db.attachment.get('', 'transparent.gif'), Error , "Invalid parameters");
});

Deno.test("should detect missing parameters (callback) - db.attachment.get", () => {
  const db = nano.db.use('db');
  return new Promise((resolve, reject) => {
    db.attachment.get(undefined, undefined, undefined, (err: any, data: any) => {
      assertNotEquals(err === null && typeof err === "object", true);
      resolve();
    });
  });
});
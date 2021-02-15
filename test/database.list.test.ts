import { assertEquals } from "https://deno.land/std@0.86.0/testing/asserts.ts";
import { stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";
import type { Stub } from "https://deno.land/x/mock@v0.9.4/stub.ts";

import dbScope from '../lib/nano.js';
import { mockResponse } from "./helpers/mocks.ts";

const nano:any = dbScope('http://localhost:5984');
const response = ['rita', 'sue', 'bob'];

Deno.test("should be to get list of databases - GET /_all_dbs - nano.db.list", async () => {
  const fetchStub: Stub<any> = stub(window, "fetch", mockResponse(200, response));
  const p = await nano.db.list();

  try{
    assertEquals(p, response);
  } finally {
    fetchStub.restore();
  }
});
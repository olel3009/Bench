import http from "k6/http";
import { check } from "k6";
import { Counter, Trend } from "k6/metrics";

export let options = { vus: 1, duration: "600s" };

// Metriken
export let totalOps = new Counter("total_operations");
export let createDuration = new Trend("create_duration");

export function setup() {
    http.post("http://localhost:3002/api/bookshelf/db/create", null, {
        tags: { operation: "setup_db" },
    });
}

export default function () {
    let start = Date.now();
    let res = http.post("http://localhost:3002/api/bookshelf/resource", JSON.stringify({ name: "Test" }), {
        headers: { "Content-Type": "application/json" },
        tags: { operation: "bookshelf_create" },
    });
    createDuration.add(Date.now() - start);
    totalOps.add(1);
    check(res, { "Status is 201": (r) => r.status === 201 });
}

export function teardown() {
    http.del("http://localhost:3002/api/bookshelf/db/drop", null, {
        tags: { operation: "teardown_db" },
    });
}

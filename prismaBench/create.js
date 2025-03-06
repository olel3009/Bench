import http from "k6/http";
import { check } from "k6";
import { Trend } from "k6/metrics";

export let options = {
    vus: 1,
    duration: "600s", // 10 Minuten
};

export let createDuration = new Trend("create_duration");

let totalOps = 0;
let testStart = Date.now();

export function setup() {
    // "Erstelle" die DB (Migration erfolgt extern, hier nur Rückmeldung)
    http.post("http://localhost:3001/api/prisma/db/create", null, {
        tags: { operation: "setup_db" },
    });
}

export default function () {
    let start = Date.now();
    let res = http.post(
        "http://localhost:3001/api/prisma/resource",
        JSON.stringify({ name: "Test" }),
        {
            headers: { "Content-Type": "application/json" },
            tags: { operation: "create" },
        }
    );
    let duration = Date.now() - start;
    createDuration.add(duration);
    totalOps++;
    check(res, { "Status is 201": (r) => r.status === 201 });
}

export function teardown() {
    let testEnd = Date.now();
    let totalTestTimeSec = (testEnd - testStart) / 1000;
    let opsPerSec = totalOps / totalTestTimeSec;
    console.log(`Total operations: ${totalOps}`);
    console.log(`Total test time (s): ${totalTestTimeSec}`);
    console.log(`Operations per second: ${opsPerSec.toFixed(2)}`);
    http.del("http://localhost:3001/api/prisma/db/drop", null, {
        tags: { operation: "teardown_db" },
    });
}

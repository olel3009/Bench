import http from "k6/http";
import { check } from "k6";
import { Counter, Trend } from "k6/metrics";

export let options = {
    vus: 1,
    duration: "600s", // 10 Minuten
};

// Definiere benutzerdefinierte Metriken:
export let totalOps = new Counter("total_operations");
export let createDuration = new Trend("create_duration");

export function setup() {
    // Erstelle die Datenbank (Tabellen) vor dem Test
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
            tags: { operation: "seq_create" },
        }
    );
    let duration = Date.now() - start;
    createDuration.add(duration);
    totalOps.add(1);
    check(res, { "Status is 201": (r) => r.status === 201 });
}

export function teardown() {
    // Teardown: Lösche die Datenbank (Tabellen)
    http.del("http://localhost:3001/api/prisma/db/drop", null, {
        tags: { operation: "teardown_db" },
    });
    // Die benutzerdefinierten Metriken werden im Summary automatisch angezeigt.
}

import http from "k6/http";
import { check } from "k6";

export let options = {
    vus: 1,
    duration: "600s", // 10 Minuten
};

export function setup() {
    http.post("http://localhost:3001/api/prisma/db/create", null, {
        tags: { operation: "setup_db" },
    });
    return {}; // Kein persistenter Datensatz erforderlich
}

export default function () {
    // Erstelle in jeder Iteration einen neuen Datensatz
    let createRes = http.post(
        "http://localhost:3001/api/prisma/resource",
        JSON.stringify({ name: "Test" }),
        {
            headers: { "Content-Type": "application/json" },
            tags: { operation: "create_for_delete" },
        }
    );
    check(createRes, { "Create Status is 201": (r) => r.status === 201 });
    let resourceId = JSON.parse(createRes.body).id;

    // Lösche den erstellten Datensatz
    let delRes = http.del(`http://localhost:3001/api/prisma/resource/${resourceId}`, null, {
        tags: { operation: "delete" },
    });
    check(delRes, { "Delete Status is 200": (r) => r.status === 200 });
}

export function teardown() {
    http.del("http://localhost:3001/api/prisma/db/drop", null, {
        tags: { operation: "teardown_db" },
    });
}

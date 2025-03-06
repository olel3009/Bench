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
    // Lege einen Testdatensatz an, der in den Iterationen aktualisiert wird
    let res = http.post(
        "http://localhost:3001/api/prisma/resource",
        JSON.stringify({ name: "Test" }),
        { headers: { "Content-Type": "application/json" } }
    );
    let data = JSON.parse(res.body);
    return { resourceId: data.id };
}

export default function (data) {
    let res = http.put(
        `http://localhost:3001/api/prisma/resource/${data.resourceId}`,
        JSON.stringify({ name: "Updated Test" }),
        {
            headers: { "Content-Type": "application/json" },
            tags: { operation: "update" },
        }
    );
    check(res, { "Status is 200": (r) => r.status === 200 });
}

export function teardown() {
    http.del("http://localhost:3001/api/prisma/db/drop", null, {
        tags: { operation: "teardown_db" },
    });
}

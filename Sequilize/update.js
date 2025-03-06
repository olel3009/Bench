import http from "k6/http";
import { check } from "k6";
import { Counter, Trend } from "k6/metrics";

export let options = {
    vus: 1,
    duration: "600s", // 10 Minuten
};

// Definiere benutzerdefinierte Metriken:
export let totalOps = new Counter("total_operations");
export let updateDuration = new Trend("update_duration");

export function setup() {
    // Erstelle die DB und eine Ressource vor dem Test
    http.post("http://localhost:3001/api/sequelize/db/create", null, {
        tags: { operation: "setup_db" },
    });

    let res = http.post(
        "http://localhost:3001/api/sequelize/resource",
        JSON.stringify({ name: "Test" }),
        { headers: { "Content-Type": "application/json" } }
    );
    let data = JSON.parse(res.body);
    return { resourceId: data.id };
}

export default function (data) {
    let start = Date.now();
    let res = http.put(
        `http://localhost:3001/api/sequelize/resource/${data.resourceId}`,
        JSON.stringify({ name: "Updated Test" }),
        {
            headers: { "Content-Type": "application/json" },
            tags: { operation: "seq_update" },
        }
    );
    let duration = Date.now() - start;
    updateDuration.add(duration);
    totalOps.add(1);
    check(res, { "Status is 200": (r) => r.status === 200 });
}

export function teardown() {
    http.del("http://localhost:3001/api/sequelize/db/drop", null, {
        tags: { operation: "teardown_db" },
    });
}

import http from "http";

setTimeout(async () => {
  const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/notifications",
    method: "GET",
  };

  const req = http.request(options, (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      try {
        const json = JSON.parse(data);
        console.log("\n📋 NOTIFICACIONES ACTUALES:\n");
        console.log("Response:", JSON.stringify(json, null, 2));
        if (!json.data) {
          console.log("Error: json.data is undefined");
          console.log("Full response:", json);
          process.exit(1);
        }
        console.log(`Total: ${json.data.length}\n`);

        // Agrupar por tipo
        const byType = {};
        json.data.forEach((n) => {
          if (!byType[n.type]) byType[n.type] = [];
          byType[n.type].push(n);
        });

        Object.entries(byType).forEach(([type, notifications]) => {
          console.log(`${type} (${notifications.length}):`);
          notifications.forEach((n, i) => {
            console.log(`  ${i + 1}. ${n.message}`);
          });
          console.log("");
        });

        process.exit(0);
      } catch (e) {
        console.error("Error parsing:", e);
        process.exit(1);
      }
    });
  });

  req.on("error", (e) => {
    console.error("Error:", e);
    process.exit(1);
  });

  req.end();
}, 2000);

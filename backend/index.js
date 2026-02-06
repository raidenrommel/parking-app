// ======================================================
// SECTION: Imports
// ======================================================
const { getSlots, paySlot, resetAll } = require("./slots");

// ======================================================
// SECTION: Lambda Entry Point
// ======================================================
exports.handler = async (event) => {

  // ===== MARKER: CI/CD BACKEND UPDATE =====
  console.log("🚀 BACKEND UPDATED VIA GITHUB ACTIONS");
  console.log("DEPLOY_TIMESTAMP:", new Date().toISOString());
  // =======================================

  console.log("EVENT:", JSON.stringify(event));
  console.log("TABLE_NAME:", process.env.TABLE_NAME);

  const method = event.requestContext?.http?.method;
  const path = event.rawPath;

  // ======================================================
  // SECTION: CORS Preflight Handling
  // ======================================================
  if (method === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders(),
      body: ""
    };
  }

  try {

    // ======================================================
    // SECTION: GET /slots
    // ======================================================
    if (method === "GET" && path === "/slots") {
      const branch = event.queryStringParameters?.branch;
      if (!branch) {
        return {
          statusCode: 400,
          headers: corsHeaders(),
          body: JSON.stringify({ error: "branch required" })
        };
      }

      const slots = await getSlots(branch);
      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: JSON.stringify(slots)
      };
    }

    // ======================================================
    // SECTION: POST /slots/pay
    // ======================================================
    if (method === "POST" && path === "/slots/pay") {
      const body = event.body ? JSON.parse(event.body) : {};
      const result = await paySlot(body);
      return {
        statusCode: result.statusCode,
        headers: corsHeaders(),
        body: JSON.stringify(result.body)
      };
    }

    // ======================================================
    // SECTION: POST /reset
    // ======================================================
    if (method === "POST" && path === "/reset") {
      const result = await resetAll();
      return {
        statusCode: result.statusCode,
        headers: corsHeaders(),
        body: JSON.stringify(result.body)
      };
    }

    // ======================================================
    // SECTION: 404 Handler
    // ======================================================
    return {
      statusCode: 404,
      headers: corsHeaders(),
      body: JSON.stringify({ error: "Not found" })
    };

  } catch (err) {

    // ======================================================
    // SECTION: Error Handling
    // ======================================================
    console.error("LAMBDA ERROR:", err);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: "Internal Server Error" })
    };
  }
};

// ======================================================
// SECTION: CORS Headers Helper
// ======================================================
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Content-Type": "application/json"
  };
}


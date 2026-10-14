// backend/scripts/setupDevice.js
/**
 * Run this ONCE to pair the simulator (or later, tell your ESP32) with
 * your account. It logs in normally, requests a device key, and saves
 * it locally — mimicking exactly the "Pair New Device" flow a real
 * ESP32 setup would go through.
 */
import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const API_BASE = process.env.SIMULATOR_API_BASE || "http://localhost:8080/api";
const KEY_FILE = "./.device-key.json";

async function setup() {
  const username = process.env.SIMULATOR_USERNAME;
  const password = process.env.SIMULATOR_PASSWORD;

  if (!username || !password) {
    console.error(
      "❌ Set SIMULATOR_USERNAME and SIMULATOR_PASSWORD in .env (just for this one-time setup)",
    );
    process.exit(1);
  }

  // Step 1: log in normally, exactly like the app does
  const loginRes = await axios.post(`${API_BASE}/user/login`, {
    usernameOREmail: username,
    password,
  });
  const cookies = loginRes.headers["set-cookie"];

  // Step 2: request a device key using that session
  const keyRes = await axios.post(
    `${API_BASE}/user/device-key/regenerate`,
    {},
    { headers: { Cookie: cookies.join("; ") } },
  );

  const deviceApiKey = keyRes.data.deviceApiKey;
  fs.writeFileSync(KEY_FILE, JSON.stringify({ deviceApiKey }, null, 2));
  console.log(
    `✅ Device key saved to ${KEY_FILE}. You never need to log in again for this device.`,
  );
}

setup().catch((err) =>
  console.error("Setup failed:", err.response?.data?.message || err.message),
);

import puppeteer from "puppeteer";

const TARGET_URL = "https://bill.pitc.com.pk/mepcobill";

const SELECTORS = {
  referenceInput: [
    'input[placeholder*="reference" i]',
    'input[name*="ref" i]',
    'input[id*="ref" i]',
  ],
  submitButton: ['input[type="submit"]', 'button[type="submit"]'],
};

function randomDelay(minMs, maxMs) {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function findFirstMatch(page, selectorList) {
  for (const selector of selectorList) {
    const el = await page.$(selector).catch(() => null);
    if (el) return selector;
  }
  return null;
}

function parseBillText(text) {
  const grab = (regex) => {
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  };

  return {
    consumerId: grab(/CONSUMER ID\s*\n[^\n]*\n\s*(\d+)/i),
    referenceNo: grab(/REFERENCE NO\s*\n[^\n]*\n\s*(\d+)/i),
    billMonth: grab(/BILL MONTH\s*\n[^\n]*\n\s*([A-Za-z]{3}\s?\d{2})/i),
    dueDate: grab(/DUE DATE\s*\n[^\n]*\n\s*(\d{1,2}\s[A-Za-z]{3}\s\d{2,4})/i),
    billHistory: (() => {
      const re =
        /([A-Za-z]{3}\d{2})\s+(EX\s+)?(\d{1,5})\s+(\d{1,6})\s+(\d{1,6})/g;
      const rows = [];
      let m;
      while ((m = re.exec(text)) !== null) {
        rows.push({
          month: m[1],
          units: Number(m[3]),
          billAmount: Number(m[4]),
          paymentAmount: Number(m[5]),
        });
      }
      return rows;
    })(),
  };
}

/**
 * Scrapes MEPCO's billing portal for a given reference number.
 * Throws on failure — the caller (controller) is responsible for
 * turning that into a proper HTTP error response.
 */
export async function fetchMepcoBill(referenceNumber) {
  const launchOptions = {
    headless: true,
    defaultViewport: { width: 1280, height: 900 },
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    dumpio: true, // ➕ add this — Chrome ka actual stderr/stdout console mein dikhega
    timeout: 60000, // ➕ 30s se 60s kar do, slow machine ko extra room
  };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const browser = await puppeteer.launch(launchOptions);

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(20000);

    await page.goto(TARGET_URL, { waitUntil: "networkidle2" });
    await randomDelay(800, 1800);

    const inputSelector = await findFirstMatch(page, SELECTORS.referenceInput);
    if (!inputSelector) {
      throw new Error(
        "Reference number field not found — the MEPCO portal layout may have changed.",
      );
    }

    await page.click(inputSelector);
    await randomDelay(200, 500);
    await page.type(inputSelector, referenceNumber, {
      delay: 60 + Math.random() * 80,
    });
    await randomDelay(400, 1000);

    const buttonSelector = await findFirstMatch(page, SELECTORS.submitButton);
    if (!buttonSelector) {
      throw new Error("Submit button not found on the MEPCO portal.");
    }

    await Promise.all([
      page.click(buttonSelector),
      page
        .waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 })
        .catch(() => null),
    ]);

    await randomDelay(1500, 2500);

    const rawText = await page.evaluate(() => document.body.innerText);
    const parsed = parseBillText(rawText);

    if (!parsed.billHistory || parsed.billHistory.length === 0) {
      throw new Error(
        "No bill history found — the reference number may be invalid, or the portal is temporarily unreachable.",
      );
    }

    return parsed;
  } finally {
    await browser.close(); // always close, even on error
  }
}

const {execSync} = require("child_process");
const fs = require("fs");

const cfg = JSON.parse(fs.readFileSync("config/rsi.json","utf8"));
const max = Number(cfg.maxRepairCycles || 20);

function sh(cmd) {
  return execSync(cmd,{stdio:"inherit",shell:"/bin/bash"});
}

for (let cycle=1; cycle<=max; cycle++) {
  console.log(`\n=== RSI CYCLE ${cycle}/${max} ===`);

  try {
    sh("npm run validate --prefix ../milan-sentinel");
    sh("npm run smoke --prefix ../milan-sentinel");
    console.log("TEST GATE: GREEN");
    process.exit(0);
  } catch {
    console.log("TEST GATE: RED");

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is required for autonomous repair.");
      process.exit(2);
    }

    sh("node scripts/repair.js");
  }
}

console.error("RSI stopped after maximum repair cycles.");
process.exit(3);

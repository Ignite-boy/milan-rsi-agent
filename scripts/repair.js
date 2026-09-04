const fs = require("fs");
const cp = require("child_process");

const prompt = `
You are the MILAN RSI repair agent.

Inspect the current repository and repair the failing implementation.
Search the codebase, identify the root cause, make the smallest safe code/config change,
run the relevant tests, and never claim success without evidence.

Rules:
1. Do not expose secrets.
2. Do not modify unrelated files.
3. Preserve working behavior.
4. Add a regression test for every fixed bug.
5. Run validation after every repair.
6. Do not deploy until tests pass.
7. Record the diagnosis and change in evidence/latest-repair.md.
`;

fs.writeFileSync("/tmp/milan-rsi-prompt.txt", prompt);

const r = cp.spawnSync(
  "python3",
  ["-c",`
import os
from pathlib import Path
from openai import OpenAI
client=OpenAI(api_key=os.environ["OPENAI_API_KEY"])
p=Path("/tmp/milan-rsi-prompt.txt").read_text()
r=client.responses.create(model=os.getenv("RSI_MODEL","gpt-5"),input=p)
Path("/tmp/milan-rsi-result.txt").write_text(r.output_text)
print(r.output_text)
`],
  {stdio:"inherit"}
);

if (r.status !== 0) process.exit(r.status || 1);

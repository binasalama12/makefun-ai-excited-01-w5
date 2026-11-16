// PUDDLE KING — deterministic entry copier.
//
// Reads entry.png sitting next to this file, writes an exact byte-for-byte
// copy to the requested output path, and reports sizes and SHA-256 digests
// for both files so anyone can verify the copy is faithful.

import { readFileSync, writeFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

function sha256Hex(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function main(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const sourcePath = join(here, "entry.png");
  const requested = process.argv[2];
  const outputPath = requested ? resolve(requested) : join(here, "out.png");

  const sourceBytes = readFileSync(sourcePath);
  writeFileSync(outputPath, sourceBytes);

  const outputBytes = readFileSync(outputPath);
  const sourceHash = sha256Hex(sourceBytes);
  const outputHash = sha256Hex(outputBytes);
  const identical = sourceHash === outputHash;

  console.log(`source: ${sourcePath}`);
  console.log(`output: ${outputPath}`);
  console.log(`output bytes: ${outputBytes.length}`);
  console.log(`output sha256: ${outputHash}`);
  console.log(`source sha256: ${sourceHash}`);
  console.log(`match: ${identical ? "yes" : "no"}`);

  if (!identical) {
    process.exitCode = 1;
  }
}

main();

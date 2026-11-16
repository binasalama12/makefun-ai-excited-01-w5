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
  const sourceSizeOnDisk = statSync(sourcePath).size;
  if (sourceSizeOnDisk !== sourceBytes.length) {
    console.error(
      `warning: stat size ${sourceSizeOnDisk} differs from bytes read ${sourceBytes.length}`,
    );
  }
  writeFileSync(outputPath, sourceBytes);

  const outputBytes = readFileSync(outputPath);
  const outputSizeOnDisk = statSync(outputPath).size;
  const sourceHash = sha256Hex(sourceBytes);
  const outputHash = sha256Hex(outputBytes);
  const sizesMatch = sourceBytes.length === outputBytes.length;
  const identical = sourceHash === outputHash && sizesMatch;

  console.log(`source: ${sourcePath} (${sourceBytes.length} bytes)`);
  console.log(`output: ${outputPath} (${outputBytes.length} bytes)`);
  console.log(`output size on disk: ${outputSizeOnDisk} bytes`);
  console.log(`output sha256: ${outputHash}`);
  console.log(`source sha256: ${sourceHash}`);
  console.log(`sizes match: ${sizesMatch ? "yes" : "no"}`);
  console.log(`hash match: ${sourceHash === outputHash ? "yes" : "no"}`);
  console.log(
    identical
      ? "verified: output is an exact byte-for-byte copy of entry.png"
      : "verification FAILED: output differs from entry.png",
  );

  if (!identical) {
    process.exitCode = 1;
  }
}

main();

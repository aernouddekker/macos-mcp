#!/bin/sh
# Detect drift in applescript-core.ts copies across server packages.
#
# applescript-core.ts is inlined into every package that uses AppleScript
# because @mailappmcp/shared was never published to npm. The file MUST
# stay byte-identical across every copy — if it drifts, a security-
# sensitive escape function may be patched in one package and not
# others.
#
# This script hashes every copy and fails if they are not all identical.
set -e

files=$(find packages/*/src/lib/applescript-core.ts 2>/dev/null)
if [ -z "$files" ]; then
  echo "check-shared-drift: no applescript-core.ts files found" >&2
  exit 1
fi

# Use md5 (macOS) or md5sum (Linux) — fall back gracefully
hasher="md5sum"
if ! command -v md5sum >/dev/null 2>&1; then
  hasher="md5 -q"
fi

hashes=$($hasher $files | awk '{print $1}' | sort -u)
count=$(echo "$hashes" | wc -l | tr -d ' ')

if [ "$count" != "1" ]; then
  echo "check-shared-drift: DRIFT DETECTED in applescript-core.ts copies" >&2
  $hasher $files >&2
  exit 1
fi

file_count=$(echo "$files" | wc -l | tr -d ' ')
echo "check-shared-drift: applescript-core.ts is consistent across $file_count packages"

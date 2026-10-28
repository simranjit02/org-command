#!/bin/sh
# Hire all eight AI Employees into ./org. Nothing is scheduled or sent until you install one in Claude.
set -e
cd "$(dirname "$0")"
for e in gtm-engineer seo-employee web-dev-employee social-media-employee ad-manager-employee sales-employee customer-satisfaction-employee chief-of-staff; do
  [ -d "org/$e" ] && { echo "skip $e (already hired)"; continue; }
  npx -y ai-employees@1.9.0 hire "$e" --to "org/$e"
done

#!/bin/bash
# This script ignores all incoming arguments and runs next dev with fixed parameters
# to prevent "unknown option --host" errors from environmental injection.
npx next dev -p 3000 -H 0.0.0.0

#!/bin/bash

yarn ts-node -O "{\"module\": \"commonjs\"}" ./src/meta/generateModApi.ts
prettier --config .prettierrc.yaml "./extra-resources/**/*.d.ts" --write

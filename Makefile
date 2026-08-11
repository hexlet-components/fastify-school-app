install:
	pnpm install --frozen-lockfile

dev:
	node bin/index.js

lint:
	pnpm --silent run lint
	pnpm --silent run format:check

lint-fix:
	pnpm --silent run lint:fix

.PHONY: test
test:
	pnpm test

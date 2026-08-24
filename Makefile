setup: install build

install:
	pnpm install --frozen-lockfile

build:
	pnpm run build

dev:
	pnpm run dev

start:
	pnpm start

lint:
	pnpm --silent run lint
	pnpm --silent run format:check

lint-fix:
	pnpm --silent run lint:fix

.PHONY: test
test:
	pnpm test

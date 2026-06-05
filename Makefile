install:
	npm ci

dev:
	node bin/index.js

lint:
	npx biome check .

lint-fix:
	npx biome check --write .

.PHONY: test
test:
	npm test

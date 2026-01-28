install:
	npm ci

dev:
	node bin/index.js

lint:
	npx eslint .

lint-fix:
	npx eslint . --fix

.PHONY: test
test:
	@echo "No tests configured yet"
	@echo "Test step passed (placeholder)"

install:
	npm ci

dev:
	node bin/index.js

lint:
	npx eslint .

lint-fix:
	npx eslint . --fix
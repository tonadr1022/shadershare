MIGRATE := docker compose run --rm migrate

.PHONY: up
up: ## run docker compose up
	docker compose up --build -d

.PHONY: upi
upi: 
	docker compose up --build

.PHONY: stop
stop: ## stop docker compose
	docker compose stop

.PHONY: down
down: ## remove docker compose containers
	docker compose down

.PHONY: migrate
migrate:
	$(MIGRATE) up

.PHONY: migrate-reset
migrate-reset: ## reset database and re-run all migrations
	@echo "Resetting database..."
	$(MIGRATE) drop -f
	@echo "Running all database migrations..."
	@$(MIGRATE) up

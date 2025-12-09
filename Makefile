# Variables
SUPABASE_PROJECT_ID=lrrygafrwyxnzbwaxntn

# Phony targets
.PHONY: help install dev build preview lint format check qa types deploy clean

# Default target
.DEFAULT_GOAL := help

# Help command
help: ## Affiche cette aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# --- Développement ---

install: ## Installe les dépendances du projet
	npm install

dev: ## Lance le serveur de développement
	npm run dev

build: ## Compile le projet pour la production
	npm run build

preview: ## Prévisualise la version de production localement
	npm run preview

clean: ## Nettoie les fichiers de build
	rm -rf .svelte-kit build

# --- Qualité Code ---

lint: ## Lance le linter (ESLint)
	npm run lint

format: ## Formate le code (Prettier)
	npm run format

check: ## Vérifie les types TypeScript et la synchro SvelteKit
	npm run check

qa: lint check ## Lance tous les contrôles de qualité (Lint + Types)

# --- Base de Données ---

types: ## Régénère les types TypeScript depuis Supabase (Projet Distant)
	npx supabase gen types typescript --project-id $(SUPABASE_PROJECT_ID) --schema public > src/lib/types/supabase.ts

# --- Déploiement (Workflow) ---

deploy: qa ## Déploie en production (Merge develop -> main -> push)
	@echo "Début du déploiement..."
	git checkout main
	git pull origin main
	git merge develop
	git push origin main
	git checkout develop
	@echo "Déploiement terminé ! Retour sur la branche develop."

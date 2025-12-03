.PHONY: help dev build check lint format install clean db-start db-stop db-reset db-push db-types

# --- Project Commands ---

# Affiche l'aide
help:
	@echo "Commandes disponibles :"
	@echo "  make dev         - Lance le serveur de développement"
	@echo "  make build       - Compile le projet pour la production"
	@echo "  make check       - Vérifie les types TypeScript"
	@echo "  make lint        - Vérifie le style du code (ESLint)"
	@echo "  make format      - Formate le code (Prettier)"
	@echo "  make install     - Installe les dépendances"
	@echo "  make clean       - Nettoie les fichiers de build"
	@echo ""
	@echo "--- Supabase ---"
	@echo "  make db-start    - Lance Supabase localement"
	@echo "  make db-stop     - Arrête Supabase localement"
	@echo "  make db-reset    - Réinitialise la base de données locale"
	@echo "  make db-push     - Pousse les migrations vers la base distante"
	@echo "  make db-types    - Génère les types TypeScript depuis la DB locale"

# Lance le serveur de développement
dev:
	npm run dev

# Compile le projet
build:
	npm run build

# Vérifie les types
check:
	npm run check

# Vérifie le code
lint:
	npm run lint

# Formate le code
format:
	npm run format

# Installe les dépendances
install:
	npm install

# Nettoie les dossiers générés
clean:
	rm -rf .svelte-kit build

# --- Supabase Commands ---

# Lance Supabase (Docker doit être lancé)
db-start:
	npx supabase start

# Arrête Supabase
db-stop:
	npx supabase stop

# Réinitialise la DB locale (Attention: supprime les données)
db-reset:
	npx supabase db reset

# Applique les migrations sur la base distante liée
db-push:
	npx supabase db push

# Génère les types TypeScript (basé sur la DB locale)
db-types:
	npx supabase gen types typescript --local > src/lib/types/supabase.ts

# Piccirilli Michael Portfolio

Portfolio full-stack personale con frontend React/Vite e backend API TypeScript, deployato su Vercel e alimentato da PostgreSQL/Supabase.

Il progetto e' stato progressivamente rifattorizzato verso una struttura piu' solida:
- frontend e backend migrati a TypeScript/TSX
- backend organizzato come `api -> service -> repository`
- accesso dati pubblico migrato a Drizzle ORM
- area admin senza dipendenza runtime da `supabase-js`
- baseline di hardening con rate limiting, error handling comune e logging strutturato

## Stato attuale

- `npm run typecheck`: verde
- `npm run lint`: verde
- `npm run build`: verde
- repository pubblici Drizzle: `about`, `profile`, `skills`, `experiences`, `projects`
- repository admin:
  - auth via Supabase Auth REST
  - CRUD via SQL diretto con client `postgres`
- `supabaseAdmin.ts`: rimosso dal runtime

## Stack tecnico

### Frontend

- React 19
- React Router 7
- Vite 7
- TypeScript 5
- CSS modulare per sezione/componente

### Backend/API

- API handlers in `api/*.ts`
- Runtime locale custom in `lib/devApiServer.ts`
- TypeScript end-to-end
- Error handling condiviso in `lib/http/apiUtils.ts`
- Logging in `lib/logger.ts`
- Rate limiting in `lib/http/rateLimit.ts`

### Data layer

- PostgreSQL (Supabase)
- Drizzle ORM
- `postgres` driver
- schema Drizzle in `lib/db/schema.ts`
- dump schema reale in `dump/dump_schema.sql`

### Tooling

- ESLint flat config
- Prettier
- `tsx` per esecuzione/watch locale del backend
- GitHub Actions per cleanup deployments

## Architettura

### Flusso backend

Per gli endpoint principali il flusso e':

```txt
api handler -> service -> repository -> database
```

Responsabilita':

- `api/*`
  - metodo HTTP
  - parsing query/body
  - cache HTTP
  - mapping errori -> risposta HTTP
- `lib/services/*`
  - orchestrazione applicativa
  - validazione di alto livello
  - composizione tra repository
- `lib/db/repositories/*`
  - accesso dati
  - mapping record -> payload applicativo
- `lib/db/schema.ts`
  - modellazione tabelle/constraint Drizzle

### Flusso frontend

```txt
App -> Context Providers -> route/view components -> fetch API -> render sezioni
```

I provider in `src/context/*` centralizzano:
- lingua
- tema
- auth admin
- profile/content data

## Struttura repository

```txt
api/
  about.ts
  experiences.ts
  health.ts
  profile.ts
  projects.ts
  skills.ts
  admin/
    login.ts
    logout.ts
    session.ts
    table.ts
    tables.ts

lib/
  adminTables.ts
  authSession.ts
  devApiServer.ts
  logger.ts
  requireAdminSession.ts
  cache/
    memoryCache.ts
  db/
    client.ts
    schema.ts
    repositories/
      aboutRepository.ts
      adminAuthRepository.ts
      adminTableRepository.ts
      experiencesRepository.ts
      profileRepository.ts
      projectsRepository.ts
      skillsRepository.ts
  http/
    apiUtils.ts
    rateLimit.ts
  services/
    adminAuthService.ts
    adminTableService.ts
    publicContentService.ts
  types/
    admin.ts
    auth.ts
    http.ts

src/
  App.tsx
  main.tsx
  components/
    css/
    jsx/
  context/
  data/
  types/

docs/
  API_CONTRACT.md

dump/
  dump.sql
  dump_schema.sql
```

## Dati e schema

Il database e' strutturato attorno a tabelle base + tabelle `*_i18n` per il contenuto localizzato.

Pattern principali:
- `profile` + `profile_i18n`
- `hero_roles` + `hero_roles_i18n`
- `about_interests` + `about_interests_i18n`
- `projects` + `projects_i18n` + `project_tags`
- `github_projects` + `github_projects_i18n` + `github_project_tags` + `github_project_images`
- `experiences` + `experiences_i18n`
- `education` + `education_i18n`
- `tech_categories` + `tech_categories_i18n` + `tech_items`
- `skill_categories` + `skill_categories_i18n` + `skill_items` + `skill_items_i18n`

Locale supportate:
- `it`
- `en`

Lo schema Drizzle e' stato riallineato al dump reale del DB, inclusi:
- `bigint` / `smallint` corretti
- primary key composite sulle tabelle `*_i18n`
- unique su `order_index`
- unique su `slug`
- unique composite su molte tabelle figlie

## Variabili ambiente

Il progetto usa [`.env.local`](/c:/Users/micha/Desktop/Piccirilli_Michael_Portfolio/.env.local).

Variabili richieste:

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SECRET_KEY=<service-role-or-secret>
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/postgres?sslmode=require
```

Note:
- `SUPABASE_URL` e' la URL HTTP del progetto Supabase
- `SUPABASE_SECRET_KEY` serve al login admin via REST Auth
- `DATABASE_URL` serve a Drizzle, `postgres` e `pg_dump`
- `DATABASE_URL` deve essere una vera connection string Postgres, non una URL HTTP

## Script principali

### Sviluppo

Frontend:

```bash
npm run dev
```

Backend API locale in watch mode:

```bash
npm run dev:api
```

Frontend + backend insieme:

```bash
npm run dev:fast
```

Simulazione ambiente Vercel:

```bash
npm run dev:vercel
```

### Qualita'

```bash
npm run typecheck
npm run lint
npm run build
npm run format
```

### Drizzle

```bash
npm run db:generate
npm run db:migrate
npm run db:studio
```

## Runtime locale

### Frontend

- Vite gira di default su `http://localhost:5173`
- il frontend proxya `/api` verso `http://localhost:3000`

### Backend

- il server locale custom gira su `http://localhost:3000`
- `dev:api` usa `tsx watch`, quindi i cambi a `api/*` e `lib/*` si ricaricano automaticamente nella maggior parte dei casi

## Cache, error handling e rate limiting

### Cache

Gli endpoint pubblici usano una cache in memoria TTL tramite:
- [memoryCache.ts](/c:/Users/micha/Desktop/Piccirilli_Michael_Portfolio/lib/cache/memoryCache.ts)

Uso attuale:
- `profile`
- `about`
- `projects`
- `skills`
- `experiences`

### Error handling

Helper comuni:
- [apiUtils.ts](/c:/Users/micha/Desktop/Piccirilli_Michael_Portfolio/lib/http/apiUtils.ts)
- [logger.ts](/c:/Users/micha/Desktop/Piccirilli_Michael_Portfolio/lib/logger.ts)

Funzioni principali:
- enforcement del metodo HTTP
- `HttpError`
- risposta errore uniforme
- logging contestualizzato

### Rate limiting

Implementazione:
- [rateLimit.ts](/c:/Users/micha/Desktop/Piccirilli_Michael_Portfolio/lib/http/rateLimit.ts)

Applicazioni attuali:
- `POST /api/admin/login`: `5 req/min` per client
- `/api/admin/table`: `120 req/min` per client

Limite attuale:
- process-local, non condiviso tra istanze

## Autenticazione admin

### Sessione

La sessione admin e' cookie-based e firmata lato server:
- creazione/verifica in [authSession.ts](/c:/Users/micha/Desktop/Piccirilli_Michael_Portfolio/lib/authSession.ts)
- enforcement in [requireAdminSession.ts](/c:/Users/micha/Desktop/Piccirilli_Michael_Portfolio/lib/requireAdminSession.ts)

### Login

Il login admin non usa piu' `supabase-js`.

Flusso:
1. `POST /api/admin/login`
2. `adminAuthService`
3. `adminAuthRepository`
4. chiamata HTTP a `SUPABASE_URL/auth/v1/token?grant_type=password`
5. creazione cookie sessione locale firmata

### CRUD admin

L'endpoint generico [table.ts](/c:/Users/micha/Desktop/Piccirilli_Michael_Portfolio/api/admin/table.ts):
- valida il nome tabella tramite [adminTables.ts](/c:/Users/micha/Desktop/Piccirilli_Michael_Portfolio/lib/adminTables.ts)
- valida payload/limit
- esegue CRUD dinamico tramite SQL parametrizzato

Per sicurezza:
- i nomi tabella/colonna vengono validati come identifier SQL
- i valori sono passati come parametri
- le tabelle ammesse sono whitelistate

## API pubbliche

Dettaglio completo:
- [API_CONTRACT.md](/c:/Users/micha/Desktop/Piccirilli_Michael_Portfolio/docs/API_CONTRACT.md)

Endpoint principali:
- `GET /api/profile?lang=it|en`
- `GET /api/about?lang=it|en`
- `GET /api/projects?lang=it|en`
- `GET /api/experiences?lang=it|en`
- `GET /api/skills?lang=it|en`
- `GET /api/health`

Endpoint admin:
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/session`
- `GET|POST|PATCH|DELETE /api/admin/table`
- `GET /api/admin/tables`

## Frontend

Sezioni principali:
- `Navbar`
- `HeroTyping`
- `About`
- `Projects`
- `Skills`
- `Experience`
- `Contact`
- `Footer`

Area admin:
- `AdminLogin`
- `AdminDashboard`

Dati statici locali:
- [staticI18n.json](/c:/Users/micha/Desktop/Piccirilli_Michael_Portfolio/src/data/staticI18n.json)
- [icons.tsx](/c:/Users/micha/Desktop/Piccirilli_Michael_Portfolio/src/data/icons.tsx)

## Deploy

### Vercel

Il progetto e' pensato per deploy su Vercel:
- branch di produzione: `main`
- preview deploy su branch non-production
- config runtime in [vercel.json](/c:/Users/micha/Desktop/Piccirilli_Michael_Portfolio/vercel.json)

### GitHub Actions

Workflow presente:
- [cleanup-deployments.yml](/c:/Users/micha/Desktop/Piccirilli_Michael_Portfolio/.github/workflows/cleanup-deployments.yml)

Scopo:
- mantenere solo gli ultimi deployment GitHub `preview` e `production`

Nota:
- questa pulizia riguarda i record GitHub deployments
- non sostituisce la retention interna di Vercel

## Dump database

Directory:
- [dump/](/c:/Users/micha/Desktop/Piccirilli_Michael_Portfolio/dump)

File utili:
- [dump_schema.sql](/c:/Users/micha/Desktop/Piccirilli_Michael_Portfolio/dump/dump_schema.sql)
  - il piu' utile per modellare schema e constraint
- [dump.sql](/c:/Users/micha/Desktop/Piccirilli_Michael_Portfolio/dump/dump.sql)
  - utile se serve ispezionare anche dati reali

## Convenzioni operative

- usare il path reale della repo `Piccirilli_Michael_Portfolio`, non la vecchia junction `mik1810.github.io`
- per Git e' preferibile mantenere un solo workflow coerente per evitare problemi di line endings tra Windows e WSL
- `SESSION.md` e' il diario tecnico delle modifiche svolte finora
- `IMPROVEMENTS.md` contiene la roadmap evolutiva del progetto

## Stato roadmap

Completato o quasi completato:
- setup TypeScript
- migrazione TS/TSX app
- repository layer
- service layer
- hardening backend base
- fondazione Drizzle
- migrazione repository pubblici a Drizzle
- rimozione dipendenza runtime da `supabaseAdmin.ts`

Ancora aperto:
- ulteriori improvements funzionali/UX
- eventuale consolidamento Drizzle lato admin/schema-driven CRUD
- evoluzioni SEO / pagina progetto singolo / refinements architetturali

## Riferimenti interni

- roadmap: [IMPROVEMENTS.md](/c:/Users/micha/Desktop/Piccirilli_Michael_Portfolio/IMPROVEMENTS.md)
- session log: [SESSION.md](/c:/Users/micha/Desktop/Piccirilli_Michael_Portfolio/SESSION.md)
- contratto API: [API_CONTRACT.md](/c:/Users/micha/Desktop/Piccirilli_Michael_Portfolio/docs/API_CONTRACT.md)
- schema DB dump: [dump_schema.sql](/c:/Users/micha/Desktop/Piccirilli_Michael_Portfolio/dump/dump_schema.sql)

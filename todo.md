# TODO (per domani)

## Priorita alta
- Riprendere il tema upload file per produzione Vercel (discusso prima, rimandato a domani):
  - upload lato admin via API (`/api/admin/upload`)
  - salvataggio su storage persistente (Supabase Storage)
  - salvataggio nel DB di `path`/`publicUrl` (niente path locali)
  - eventuale supporto signed URL per file privati
  - nota: per ora non implementare; prima decidere bene modello dati/storage e UX admin dell'upload
  - stato discussione:
    - nel repo oggi non esiste `/api/admin/upload`
    - i campi file oggi sono gestiti come semplici URL/stringhe nel DB
    - campi reali coinvolti: `profile.photo_url`, `profile.cv_url`, `profile.university_logo_url`, `experiences.logo`, `education.logo`
    - primo incrementale ipotizzato: endpoint admin protetto + upload su Supabase Storage + ritorno di `path`/`publicUrl` + integrazione admin
- Sezione Experience: rivedere layout header card, perché l'icona ora risulta troppo centrata e non piace il risultato visivo.

## Idee miglioramento sezione Skills
3. Collegare skill ai progetti (click skill -> progetti correlati).
8. Aggiungere sezione `Cloud & Infra` (AWS/GCP/Azure, Supabase, Vercel, DB).
10. Aggiungere evidenze pratiche per area (link repo/demo).
11. Aggiungere fallback icone quando un devicon non esiste.
12. Migliorare ordinamento skill da admin (order_index semplice o drag/drop).

## Nota operativa
- Evitare hardcode nel frontend: preferire DB + i18n (`staticI18n.json`) dove serve solo etichetta UI.
- Valutare passaggio a un ORM per il DB, per gestire meglio schema, query, migrazioni e consistenza del modello dati.

## Nuova sezione progetti GitHub
- Aggiornare la nuova sottosezione sotto `Projects & Competitions` per leggere i contenuti dalle nuove tabelle Supabase invece che da dati hardcodati nel frontend.
- Rivedere e migliorare le descrizioni dei progetti GitHub (`unify`, `f1-race`, `webmarket`, `image-processing`) con testi finali piu precisi.
- Aggiungere qualche progetto che riguardi il machine learning
- Recuperare/preparare immagini reali per i progetti `unify`, `f1-race` e `webmarket` e sostituire i placeholder attuali.

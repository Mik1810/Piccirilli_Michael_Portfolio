# TODO (per domani)

## Priorita alta
- Riprendere il tema upload file per produzione Vercel (discusso prima, rimandato a domani):
  - upload lato admin via API (`/api/admin/upload`)
  - salvataggio su storage persistente (Supabase Storage)
  - salvataggio nel DB di `path`/`publicUrl` (niente path locali)
  - eventuale supporto signed URL per file privati
- Sezione Experience: rivedere layout header card, perché l'icona ora risulta troppo centrata e non piace il risultato visivo.

## Idee miglioramento sezione Skills
1. Aggiungere blocco `Education` stack separato (corsi, certificazioni, badge).
2. Aggiungere blocco dedicato `AI/ML` (LLM, CV, NLP, MLOps).
3. Aggiungere livello competenza per skill (`base/intermedio/avanzato`).
4. Aggiungere `Last used` o `Years of experience` per tecnologia.
5. Collegare skill ai progetti (click skill -> progetti correlati).
6. Aggiungere filtro rapido per categoria (tabs/chips).
7. Aggiungere search box nelle skill.
8. Aggiungere sezione `Currently learning`.
9. Aggiungere sezione `Tooling & Workflow` (Git, CI/CD, testing, linting, Docker, Linux).
10. Aggiungere sezione `Cloud & Infra` (AWS/GCP/Azure, Supabase, Vercel, DB).
11. Aggiungere sezione `Data/Analytics` (Pandas, NumPy, Matplotlib, SQL).
12. Aggiungere evidenze pratiche per area (link repo/demo).
13. Aggiungere fallback icone quando un devicon non esiste.
14. Migliorare ordinamento skill da admin (order_index semplice o drag/drop).
15. Distinguere skill `core` (pinned) da skill secondarie.

## Nota operativa
- Evitare hardcode nel frontend: preferire DB + i18n (`staticI18n.json`) dove serve solo etichetta UI.

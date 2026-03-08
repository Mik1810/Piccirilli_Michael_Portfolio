-- Script SQL per creare la tabella experiences e policy RLS

-- 1. Creazione tabella
create table public.experiences (
  id serial primary key,
  role text not null,
  company text not null,
  start_date date,
  end_date date,
  period text,
  location text,
  logo text,
  logo_bg text,
  description text,
  tags text[],
  order_index int
);

-- 2. Abilita Row Level Security
alter table public.experiences enable row level security;

-- Sostituisci TUO_USER_ID con il tuo UUID
create policy "Solo admin può modificare"
on experiences
for all
using (auth.uid() = 'd497da96-9519-48e6-889d-15923fcfa666');

-- 4. Policy: permetti lettura a tutti
create policy "Permetti lettura a tutti"
on experiences
for select
using (true);

-- 4. Esempio inserimento dati
insert into public.experiences (
  role,
  company,
  start_date,
  end_date,
  period,
  location,
  logo,
  logo_bg,
  description,
  tags,
  order_index
) values (
  'Finalista CyberChallenge.IT',
  'CyberChallenge.IT',
  '2023-03-01',
  '2023-06-30',
  'Mar 2023 - Jun 2023',
  'L''Aquila',
  '/imgs/cyberchallenge.png',
  '#38bdf8',
  'Selezionato tra i finalisti nazionali, formazione intensiva in cybersecurity.',
  ARRAY['cybersecurity', 'CTF', 'teamwork'],
  1
);

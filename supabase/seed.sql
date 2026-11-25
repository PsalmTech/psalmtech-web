-- PsalmTech Solutions — starter course (run AFTER schema.sql)
-- Price is left empty on purpose: set it in Admin → Courses before opening registration.

with c as (
  insert into public.courses (slug, title, summary, description, price_kobo, discount_percent, cover_url, duration, mode, next_cohort, published)
  values (
    'data-analytics-power-bi',
    'Data Analytics with Power BI',
    'Hands-on training: clean data, build models and design dashboards people actually use.',
    'Learn Power BI from the ground up with guided lessons, practice datasets, assignments and personal feedback. By the end you will build and publish a complete executive dashboard.',
    null, 20, '/images/powerbi.jpg', null, null, null, true)
  on conflict (slug) do update set title = excluded.title
  returning id
), m as (
  insert into public.modules (course_id, title, position)
  select c.id, t.title, t.pos from c, (values
    ('Getting started with Power BI', 1),
    ('Power Query & data cleaning', 2),
    ('Data modelling & relationships', 3),
    ('DAX essentials', 4),
    ('Visuals & dashboard design', 5),
    ('Publishing & sharing reports', 6)
  ) as t(title, pos)
  returning id, title
)
insert into public.lessons (module_id, title, kind, position)
select m.id, l.title, 'reading', l.pos from m join (values
  ('Getting started with Power BI', 'Welcome & course roadmap', 1),
  ('Getting started with Power BI', 'Installing Power BI Desktop', 2),
  ('Getting started with Power BI', 'Tour of the interface', 3),
  ('Power Query & data cleaning', 'Connecting to data sources', 1),
  ('Power Query & data cleaning', 'Cleaning messy data', 2),
  ('Data modelling & relationships', 'Star schema explained', 1),
  ('Data modelling & relationships', 'Creating relationships', 2),
  ('DAX essentials', 'Calculated columns vs measures', 1),
  ('DAX essentials', 'CALCULATE and filter context', 2),
  ('Visuals & dashboard design', 'Choosing the right visual', 1),
  ('Visuals & dashboard design', 'Designing a clean dashboard', 2),
  ('Publishing & sharing reports', 'Publishing to Power BI Service', 1)
) as l(module, title, pos) on l.module = m.title;

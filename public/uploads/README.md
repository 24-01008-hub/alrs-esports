# ALRS · Uploads folder

Drop your real files here. The site picks them up automatically — no code editing, no build step.

```
uploads/
├── logo/
│   └── logo.png            ← your ALRS logo (the spinning 3D one + header/footer/favicon)
├── sponsors/
│   └── <id>.png            ← one file per sponsor, named like the sponsor id
├── jerseys/
│   └── <name>.png          ← jersey kit images shown on the Roster tab
├── officers/
│   └── <photo-file>        ← optional officer photos (only if you use the photo column)
└── data/
    ├── officers.csv        ← who the officers are, grouped by committee
    ├── members.csv         ← one row per member (row count = "Active Spartans")
    └── sponsors.csv        ← sponsor list + perks (replaces the demo sponsors)
```

## 1 · Logo — `uploads/logo/logo.png`

- Recommended: **square**, 1024×1024 or larger, **transparent background** (PNG or SVG).
- Used in: the spinning holographic 3D logo on the home page, header, footer, preloader, member card and favicon.
- If your logo has a solid (non-transparent) background, the 3D extrusion will look like a
  flat slab — cut the background out first.
- Accepted: `.png` `.svg` `.webp` `.jpg` (first file named `logo.` that exists wins).
- Delete `logo.png` any time to fall back to the built-in Red Spartans helmet mark.

## 2 · Sponsor logos — `uploads/sponsors/<id>.png`

The file name must match the sponsor **id** (lowercase, no spaces):

| id | sponsor |
|----|---------|
| `bitbase` | BitBase Computer and Tech |
| `keeboreds` | Keeboreds PH |
| `nexus` | Nexus Gear |
| `volta` | Volta Energy |
| `stride` | Stride Apparel |
| `hyper` | Hyperlane Fiber |
| `byte` | Byteblox Cafe |
| `kompass` | Kompass Bank |
| `arena` | Arena Cloud |
| `lumen` | Lumen Optics |
| `katsu` | Katsu Kitchen |

If you replace the demo list with your own `data/sponsors.csv`, the ids in that file become
the file names. A sponsor with no logo file simply shows its 1–2 letter monogram instead.

## 2b · Jersey kit — `uploads/jerseys/`

Drop `.png`/`.svg` images here and they appear in the Roster → **Kit room** after the next build.
Name files so they sort the way you want (e.g. `01-val.png`, `02-ml.png`).

## 3 · Officer sheet — `data/officers.csv`

Header row (exact column names, lower case):

```
name,position,committee,division,email,social,photo
```

| column | meaning |
|--------|---------|
| `name` | Full name of the officer |
| `position` | e.g. President, Vice President for Operations, Head of Broadcast |
| `committee` | maps to one of the fixed About tabs: Executive Committee, ALRS Officers, Publication, Documentation, Marketing, Creative and Talents, Technical, Games Committee. Unmatched rows fall under **ALRS Officers** |
| `division` | e.g. VALORANT, MLBB, or leave blank |
| `email` | optional, becomes a mailto link |
| `social` | optional handle shown as a chip |
| `photo` | optional file name, e.g. `president.png` → put the image in `uploads/officers/` |

Example:

```csv
name,position,committee,division,email,social,photo
Juan Dela Cruz,President,Executive Board,,juan@g.batu.edu.ph,@jdelacruz,
Maria Santos,Vice President for Operations,Executive Board,,maria@g.batu.edu.ph,,
Ramon Cruz,Tournament Director,Tournament Operations,VALORANT,ramon@g.batu.edu.ph,@ramonc,
Bea Mendoza,Head of Broadcast,Content & Media,,bea@g.batu.edu.ph,@beaonair,bea.png
```

## 4 · Member sheet — `data/members.csv`

Any columns you like — the site counts the **data rows** and shows that number as
“Active Spartans” in the About stats, hero copy and membership section.

The first column should be `name` so the file stays human-readable:

```csv
name,email,course,year,division,joined
Juan Dela Cruz,juan@g.batu.edu.ph,BS Computer Engineering,3rd Year,VALORANT,2026-06-01
```

## 5 · Sponsor sheet — `data/sponsors.csv`

```
id,name,mono,cat,tier,deal,code,cost,shape
```

- `id` — lowercase, used for the logo file name (see §2)
- `tier` — `Principal` (gold), `Partner` (red) or `Affiliate`
- `cost` — **ALRS Coins** price to redeem the perk
- `shape` — `voucher` or `perk`; decides the Marketplace category filter (vouchers = redeemable codes, perks = discounts/benefits)
- If this file has rows it **replaces** the demo sponsors entirely; delete it to restore them.

### Exporting from Google Sheets

1. Open your Sheet → **File → Download → Comma Separated Values (.csv)**
2. Save it into `uploads/data/` using the file names above (`officers.csv`, `members.csv`, `sponsors.csv`)
3. Make sure the first row is the header row with the column names listed above.

Google **Docs** (`.docx`) and PDFs are not parsed — put those details into a Sheet and
export as CSV.

## Making the CSVs load

Browsers block `fetch()` on `file://` pages, so CSV files only load when the site is served
over HTTP. Logos and sponsor images work either way.

```powershell
cd C:\Users\gkuri\Projects\alrs-esports
node server.js
```

Then open **http://localhost:8080** — the uploads folder is read live on every reload.

Opening `index.html` directly from Explorer still works; the site just falls back to the
built-in demo content for the CSV data.

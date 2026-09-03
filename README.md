# CookConnect / Nkhedmou

Monorepo for the CookConnect (Nkhedmou.ma) platform.

## Layout

| Path         | Description                                                        |
| ------------ | ------------------------------------------------------------------ |
| `Frontend/`  | Public-facing Next.js site (chefs, employers, job offers). Next 16 / React 19. |
| `Dashboard/` | Admin dashboard Next.js app. Deployed on Vercel as `cookkonnekt-dashboard`. |
| `Backend/`   | Placeholder — API not yet implemented. See `docs/backend/`.        |
| `docs/`      | Architecture, database, API contract and task breakdowns.          |

Client requirement documents (`ClientDoc_with_image.docx`,
`Nkhedmou_Change_Requirements.docx`, `Improvement points (1).pdf`) live at the
repository root.

## Getting started

Each app is an independent npm project — there is no workspace runner yet.

```bash
cd Frontend   # or Dashboard
npm install
npm run dev
```

Both apps need a local `.env.local`, which is git-ignored. Copy the values from
the corresponding Vercel project or ask the project owner.

## Not in version control

Some assets are deliberately excluded to keep the repository small:

- `CookConnect [website] Figma Design/` — 231 MB of Figma JPG exports
- `Dashboard Screenshots/`

These remain on local disk only. Keep a separate backup of them.

## History

`Frontend/` was previously the standalone repository
[`nkhedmou-frontend`](https://github.com/JAKUAN-AHMED/nkhedmou-frontend). Its
full commit history was grafted into this monorepo, so every original commit
remains reachable — browse it with `git log --graph` or `git log 8ce1417..e1aa26d`.

Note that `git log -- Frontend/` will *not* list those commits: in them the files
lived at the repository root rather than under `Frontend/`, so path filters miss
them. This is normal for a grafted subtree.

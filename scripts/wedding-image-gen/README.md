# Wedding Image Generation

This folder is separate from the wedding website. It generates preview studio wedding images while prioritizing face identity preservation.

## Why This Flow

The earlier attempts used plain prompt-based generation, which drifted into unrelated infographic-style outputs and changed the faces. This workflow uses the Images edits endpoint with reference images instead.

Key choices:

- Use clear couple and solo face references.
- Put the clearest couple image first.
- Use `gpt-image-1.5` with `input_fidelity=high` by default.
- Keep the prompt strict about preserving cheeks, jaw, chin, skin texture, and hair silhouette.
- Generate one candidate at a time and inspect before updating the site.

## Dry Run

```bash
python3 scripts/wedding-image-gen/generate-studio-wedding.py --dry-run
```

## Generate

```bash
npm run image:studio:face-lock
```

Outputs are written to:

```text
output/imagegen/studio-wedding/
```

After choosing a good result, place it in:

```text
public/images/generated-wedding/
```

Then update `src/data/invitation.ts` to use that image.

## Tuning

- Edit `reference-images.json` to change which photos are used.
- Use `npm run image:studio:face-lock` first. It uses the strictest identity-preserving prompt.
- Use `npm run image:studio:bridal` if the face is good but the photo needs more wedding styling.
- Use `npm run image:studio:gpt2` as a model comparison pass.
- Edit `studio-hero-face-lock.prompt.txt` to tune face preservation.
- Edit `studio-hero.prompt.txt` to tune wedding studio styling.
- Use `--limit 5` if too many references make the face average out.
- Use `--limit 3` if identity still drifts; keep the primary couple reference plus one clear solo reference per person.
- The script reads `.env` automatically, so keep `OPENAI_API_KEY=...` there. `.env` is gitignored.

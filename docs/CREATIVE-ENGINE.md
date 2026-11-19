# Creative Engine — v1 contract

## Purpose

The Creative Engine translates a Wish and a small set of personalization choices into a versioned, provider-neutral Creative Brief. It is the handoff contract between product intent and media generation.

## Current implementation

- `src/creative/types.ts` defines the v1 contract.
- `src/creative/preview.ts` builds a deterministic preview brief from the Wish and selected mood, style, presence, and output type.
- The preview adapter is explicitly marked `source: template-preview`. It is not an AI interpretation and must not be presented as completed media generation.
- The original Wish description is carried into the brief so later model-backed interpretation can preserve user-specific details rather than replacing them with category templates.

## Contract principles

1. Keep Wish, Generation, CreativeBrief, and MediaAsset as separate concepts.
2. Keep provider names, raw prompts, credentials, and model settings out of the client-facing contract.
3. Version the brief so future model outputs can be validated and migrated.
4. Preserve the original wish and personalization snapshot for reproducibility.
5. Treat affirmations as supportive reflection, never as a promise of guaranteed outcomes.

## Next steps

1. Add a server-side interpreter adapter that returns this schema and validates model output.
2. Persist the validated brief to `generations.creative_brief`.
3. Add representative schema and interpretation tests.
4. Feed the same brief into image, video, or audio adapters without changing the product flow.

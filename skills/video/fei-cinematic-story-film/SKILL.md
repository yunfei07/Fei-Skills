# fei-cinematic-story-film

Use this Skill to turn a narrative into a coherent cinematic film plan with strong continuity, including Chinese historical/fantasy stories.

## Inputs

Required: `story` or `source_text`. Optional: `duration`, `profile`, `characters`, `references`, `aspect_ratio`, `dialogue_mode`.

Profiles include `wuxia`, `jianghu`, `zhiguai`, `historical`, `mythology`, reusing compatible concepts from `chinese-cinematic-3d-prompts`.

## Workflow

1. Parse story into dramatic beats.
2. Build character locks, costume/prop locks and scene locks.
3. Build reference IDs before shots reference images.
4. Convert beats into scenes, then shots.
5. For every shot specify framing, lens intent, camera move, blocking, action, lighting, ambience, sound cue and transition.
6. Track continuity across adjacent shots.
7. Produce storyboard and animatic timing plan.
8. If an image/video generation runtime is used, keep prompts subordinate to the locked shot specification.

## Outputs

`beat-sheet`, `character-locks`, `scene-locks`, `reference-map`, `shot-list`, `storyboard`, `sound-cues`, `transition-map`, `animatic-timeline` and optional rendered artifacts.

## Hard rules

Do not collapse symbolic or mythic material into historical fact. Historical claims requiring accuracy must be sourced or explicitly marked as dramatization.

# Fei Director Planner

The Director Planner converts a semantic scene into a staged explanation.

For every important scene decide:
1. `focus`: the single relationship the viewer must understand.
2. `reading_order`: the intended visual scan order.
3. `transition`: how the scene enters/exits without competing with the idea.
4. `stable_frame`: normalized scene progress (0–1) that represents the best still for QA.
5. `evidence`: what is literal, measured, schematic or illustrative.

Director decisions must improve comprehension. Renderer novelty is not a valid reason for a shot.

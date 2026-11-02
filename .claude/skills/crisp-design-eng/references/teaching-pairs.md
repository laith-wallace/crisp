# Teaching Pairs

A bad/good pair is the same screen twice with exactly one thing wrong on the left. Use a pair to diagnose: find the row that looks like your bug, then read why the good half works. The bad half is never a starting point.

Adapted from benjitaylor/skills stageshow (`references/teaching.md`, MIT, Copyright (c) 2026 Benji Taylor), rescoped from product-demo stages to ordinary interfaces.

## Motion pairs

Watch at normal speed first, then step through the transition. Matching start and end screenshots prove nothing about the frames between.

| Failure | Look at | Correction |
|---|---|---|
| Instant label swap | A button label changing from "Save" to "Saved" in one frame | Keep the button; clip the label slot so the old words leave as the new words enter |
| Result without press feedback | The result appears while the button shows no press | Press and surface response first (`:active` scale 0.97), then the result |
| A new row shoves its neighbours | The rows below an inserted row | Animate the container's height so the rows below travel with it; or reserve the space |
| Object loses its identity | A plus icon replaced by a close icon | Keep the same strokes and rotate them 45 degrees |
| Exit is skipped | A toast removed the frame its close button is pressed | Keep it mounted for its exit (150-200ms), then remove it |
| Interrupted motion restarts | A tab highlight redirected mid-move jumps back to its start | Keep the element mounted and retarget from where it is; never re-key its entrance |
| Landing jumps at handoff | A flying avatar lands a few pixels off its destination | Measure the destination element itself, not its padded wrapper |
| A reset with no cause | A list of added files clears itself | Give the reset a visible cause: the user presses Clear |
| Added content shifts its neighbour | A status icon appears and the label beside it jumps | Open the icon's width and gap together while the label travels |
| Surface and content resize apart | A popover grows, then its content snaps in | One coordinated geometry for surface and content; text never stretches |
| Drag starts from the wrong point | A dragged card jumps so its corner sits under the pointer | Keep the pointer's offset inside the object through travel and release |
| Spinner starts after it appears | The first frames of a saving state show a still spinner | Start rotation before it is visible; keep turning through the fade out |
| Text shifts as it settles | Neighbouring words move a pixel when a label changes | Move the label by transform inside a stable grid, not by margin |
| Scroll reveals a harsh crop | Rows sliced by a scrolling container's edge | Fade only the edge hiding content; clear the fade when nothing is hidden |
| Dependent changes start together | Price, tax and total all change in the same frame | Offset the related starts by 40-80ms while their movements overlap |

## Still pairs

Same content on both sides, so the difference is structure, not a prettier story.

| Failure | Correction |
|---|---|
| Every part shouts: nested borders, shadows and accents on every subpart | Quieten the supporting details before adding another container |
| Desktop screen scaled into a phone slot | Reflow for the width; a shrunk layout passes overflow checks while its text becomes unreadable |
| Near-tangent edges: two boxes almost touching | Overlap clearly or separate by at least 8px; check corners too |
| Inset broken at the bottom of a nested card | Carry the same inset round all four sides |
| Icon and label off-balance in a button | Judge the visible glyph, not its SVG box; centre the pair, not each part |
| Whitespace spread evenly | Use space to group: tight inside a group, loose between groups |
| Quiet means faint | Secondary text still passes 4.5:1; quiet is weight and size, not low contrast |
| Mixed icon families | One construction, one stroke, one optical size |
| A gradient or glow that serves nothing | Remove it, or tie it to the one thing the story is about |
| An unread dot pushes its row in | The dot sits in a reserved gutter; rows keep one left edge |
| The result loses to the list | The new item is one thin row in a long list; fewer, larger rows make it the heaviest thing |
| The crop cuts the story | Move the frame until the last value that matters is whole; only filler runs off an edge |
| One top-bar control with an empty side | Put what the product puts there, or drop the bar |
| Sample data that does not fit | Pick names and values whose length suits the layout: no truncated chips or wrapped names |
| Translucent icon ink | Strokes paint darker where they cross; use one opaque colour |

## Style pairs

Each bad side has one fault; the good side never changes.

| Fault | Correction |
|---|---|
| Purple-to-pink gradient ground, gradient text | The product's own neutrals; one accent on the thing that matters |
| 9-10px type to fit more | 13-14px names, 11-12px metadata, fewer rows |
| Every row carries branch, hash, author, duration, badge | Real detail only on the row the story is about |
| Coloured glow on a card or button | One soft neutral shadow |
| Tracked capitals on headings, labels, buttons | Sentence case, unless the product itself capitalises |
| Sparkles, wands, gradient "AI" chips | The product's own mark, or a plain label that says what happens |

## Making a pair

Change one thing. Same content, layout, endpoints and input timing; only the behaviour being taught differs. Say the exact difference under each side. If the lesson only shows at slow speed, the pair needs another go.

## What a pair cannot show

Some faults need the real screen: whether a reset makes sense for what the user just did, whether a flying object vanishes before its destination takes over, whether a desktop layout is readable at phone width. A checker can flag a jump and still miss a wrong path or an unreadable crop. Say what the tools covered and what you watched yourself.

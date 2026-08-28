# The statement: what Studio Zohdi is, in as few words as possible

Type: grilling
Status: resolved
Blocked by: —

## Question

What does a visitor need to understand about Studio Zohdi, and what is the shortest set of words that gets them there?

The brief asks to minimise copy as far as it will go while still leaving a visitor with a real understanding of what the studio is. That tension is the whole ticket: every word cut sharpens the page, and one word too many makes it a paragraph.

Things this needs to resolve:

- The positioning itself. Today's site says "Software Development Studio" and little else. Is that the claim, or is there something sharper about what Jake actually does — the kind of work, the kind of client, the way it's built?
- How many words the page gets. A single line? A line plus a qualifier? A word count is a design constraint the composition ticket will need.
- Whether the studio speaks as "we" or as Jake. There's a personal link to `jakezohdi.dev` on the page, so the relationship between the studio and the person is already on screen and has to read deliberately.
- Whether the two links need any words around them, or whether "Work" and the personal link stand alone.
- What is deliberately *not* said. Services, tech stack, availability, location — each one is a candidate for the cutting-room floor, and saying so explicitly stops it creeping back in later.

Do not invent facts about the business. Where something isn't known, ask.

## Answer

### The sentence

> I take software products from idea to live — and keep them there.

That is the entire body copy of the page. There is no second line, no supporting paragraph, no availability note.

### The page's five elements

1. `STUDIO ZOHDI` — the studio name
2. The sentence above
3. `See the work →` — primary, routes to `/work`
4. `More about me ↗` — secondary, external, to `jakezohdi.dev`
5. `let's talk` — a third, deliberately quieter contact link (`jake@studio-zohdi-llc.com`), subordinate to the other two, matching how the current topbar already treats `LET'S TALK!`

### The decisions behind it

**Positioning: general, not the niche.** The six commissions cluster tightly in SEC filings, market surveillance, and financial research, and claiming that niche was on the table. Jake chose to stay open — the statement names no sector, so a prospective client outside finance isn't turned away at the door. The trade-off was named and accepted: a general line carries less information, which is why the line has to work harder.

**The claim: end to end.** With the sector off the table, the one thing the sentence must land is that the work runs the whole span — designed, built, shipped, and kept alive afterwards — not a slice of someone else's project. This is what "from idea to live — and keep them there" encodes; the final clause is the load-bearing half, because staying with a product after launch is the part most builders skip.

**Voice: first person singular.** Studio Zohdi is Jake, working solo, and the page says so. "I", never "we". This makes the `jakezohdi.dev` link cohere — the studio and the person are openly the same thing — rather than reading as a stray link to somebody else.

**Word budget: one line, nothing else.** The tightest reading of "minimise copy". This is a hard constraint on the composition, not a target: the sentence *is* the design object, since a page with no scroll has nothing else to carry it. An availability beat ("Currently taking on new work") was considered and cut.

**Link labels: verbed, both of them.** `See the work` and `More about me` rather than bare `Work` / `jakezohdi.dev`. Spelling out both actions costs a few words but leaves nothing to infer.

**Client work, not products.** All six projects were built for paying clients. Recorded because the site currently asserts otherwise in places, and because it rules out any "products I run" framing in future copy.

### Deliberately not said

The sector or industry. A services list. Any technology or stack. Location. Availability or rates. Team size — the "I" implies it without stating it. Each of these was live at some point in the discussion and each was cut; they should not creep back in during composition.

### Finding for the out-of-scope production work

`SITE.description` in `src/lib/seo/site.ts` reads "showcasing recent client work across product, commerce, creative, and energy experiences". The "client work" half is correct. The categories are wrong — nothing in the lineup is commerce, creative, or energy. This needs fixing, but meta description sits in the production-hardening work this map has ruled out of scope.

### Amendment (after the composition was built)

Jake dropped the em dash: the sentence is now **"I take software products from idea to live and keep them there."** Same words, one breath instead of two.

### Amendment 2 (August 2026)

Jake changed the final clause: the sentence is now **"I take software products from idea to live and keep them growing."**

Divide the text into topical sections, each of which
- describes what happened and my reflections
- summarize 1) lessons for humans and 2) lessons for agents


===
Overall, there was still a lot of work. Not as hands-off as working with grad students.

A lot of manually describing the task and giving feedback in the prompt, which I feel is a sub-optimal approach: it feels too rushed, too improvised. 

A better approach, which I only found out later, is to pre-defined specialized skill---recurring tasks whose re that we take time to craft and test.

Example: (specific to this project) expanding literature, a task that follows certain steps, e.g., reading the existing text, come up with query to search for more relevant literature, run semantic scholar api, filter and report results back.

One example task that should have been pre-defined is "address my comments". This happened a lot at the writing stage and is also a crucial part of making progress. But somehow it feels under-defined when you simply type the three words in the prompt. A better approach could have been providing the agent a taxonomy of my comments with examples to demonstrate the best way to address each kind.

---

Better define how agents respond.

- This has a high recurring cost but I never got to deal with it seriously.
- I did have a global response format: details → executive summary → actionable items; but this isn't optimized for research 

One non-unique problem is reading the response in the conversation thread vs. reading it in a doc. Although the contents are the same, these two media feel very different: reading it in a thread feels rushed (I believe this is because we are used to firing short messages in a chat---being in a chat thread frames an impatient mindset/attention-span to anticipate short messages and dislike reading long text, tending to skip them)

So It seems the first-order problem is length;
To tackle this, 
1. a primary principle is that the response in chat should never be longer than X (appropriate for our attention span) and longer responses need to be offloaded to a doc for review outside of the chat
2. In-chat response follows the existing executive summary (i.e., short answer) → actionable items format; 
3. documented responses need more thinking: I did find info overload is also a problem. It should probably be capped as one page? The format also can be pre-taxonomized: planning (steps to take to achieve something), diagnosis (troubleshooting some problems), summary of actions taken, etc.


---

The tyranny of chat-centered interaction

problems:

1. Unwieldy for parallel workflow. Oft-times the agent will identify multiple issues that need further work. A natural interaction model would be a parallel structure to follow up on each of the issues one by one without losing track of the big picture. But the current interaction is highly conducive to linear workflows (you'd have to manually and awkwardly open multiple threads, copy-paste the issues there, perform multiple buttons clicks to go back and forth between issues in order to track progress).

2. Invocation
I often wish I could invoke the agent in ways other than typing in a prompt. In particular, I wish to have artifact-centered invocation, e.g., invocation from a to-do list, from a comment on a doc. To achieve this, currently I have to first update the artifact (e.g., add a to-do item or a comment) then type in the prompt "hey, address that thing in that place"--it feels repetitive and inefficient.

---

Before the ddl rush, I used to start a day by planning and writing down a few things to achieve in the journal. But then in the ddl crunch time, I just jumped into whatever issues I had in mind with no high-level planning or management. 

Now that I reflect on this change, I feel the journal-centered daily planning is an important metacognitive step that can help me keep my head clear, manage my time and effort. 

---

Keep a journal 

The journal keeps day-to-day entries of plans (what to work on) and documents (what gets worked on). For me, this is a familiar place for doing daily planning. For the agent, the journal serves as (according to the agent)---

Memory. I have none between sessions. The journal is how the next session learns what was already tried, including dead ends like the dropped recode.
Hand-off. It gives the next agent a starting point. That may be me, Codex or another model. The Open and Next parts are really notes to that successor.
Bookkeeping. It stores numbers and facts that live nowhere else: the corrected denominators, ρ = 0.91 rather than 0.86, which files are stale. Git records that a file changed, not that a number in it was wrong.
Anything else? Accountability. Writing "done" next to specific claims ("0 undefined references", "checked line for line") puts them where you can check them. It also makes me check them before I write them down, which catches mistakes before you see them.
Anything else? A place to leave unfinished threads. When I stop mid-task, I can write down what's unresolved instead of quietly dropping it. This is also the source of the copy-forward bloat: carrying an item forward is cheap, and closing it isn't.
Anything else? Provenance. The paper claims audit numbers are author-adjudicated and that the method can be reconstructed. The journal is part of the record behind those claims. It matters most if a reviewer challenges them in rebuttal.

---

What should I be doing while the agent is working?

I wish the agent could tell me "well, this is gonna take a while (~X minutes). Perhaps you could do Y while I am at it".

In reality, I have to figure out what to do while waiting, sometimes planning ahead ("I will do this later while waiting for the agent.


---

Proactive learning

Very often I had to change the agent's writing and feel quite frustrated to see similar writing still occurred later. I probably should have call it out and say "don't write things like that in the future" but I was too sucked into doing the revision to step out of it (this is my recurring problem as well).

I wish the agent could proactively learn from such things. when git-committing changes, ideally the agent can compare my edits with the version it keeps in its own version control system. it can simply curate examples (especially the ones where I revert its changes) and propose generalizable lessons it can implement (e.g., an update of its skills or rules)

---

RECYCLED TEXT:

assess the scale of the question (this is also something the human needs to do better at). I tend to send requests small and big--fixing some format/layout issues vs. doing a literature search. 
a better approach would be escaping the conversation mindset when the response warrants
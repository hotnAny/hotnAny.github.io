# Reflections and Lessons from Working on a Research Project with Agents

I worked with agents alone on a research project. My set-up was VS Code, with the agents running as extensions in a side panel. The collaboration ran for about three months. One agent did most of the work; a second took on a few tasks. No humans other than me were involved.

Overall, it was still a lot of work---not as hands-off as working with grad students (footnote: I am a hands-off advisor; for the hands-on type, working with an agent could feel much more relaxing).

Below are some reflections and lessons learned.

## 1. Pre-defined skills instead of improvised prompts

A lot of the work was manually describing the task and giving feedback in the prompt. When I finally asked the agent to go through my past prompts, most of them fell into a handful of recurring requests: respond to my comments, accept or strip marked-up edits, check the length and find where to cut, fill in submission paperwork. I had typed each of them from scratch many times.

One of them is "address my comments". This happened a lot at the writing stage and is also a crucial part of making progress. But it stays under-defined when you simply type those three words into the prompt. A better approach would have been to give the agent a taxonomy of my comments, with examples showing the best way to address each kind.

Improvising like this feels too rushed. What I only figured out later is to pre-define specialized skills: recurring tasks are worth the time it takes to craft and test them. Expanding the literature, for example, follows the same steps every time---reading the existing text, coming up with queries for more relevant work, running the Semantic Scholar API, then filtering the results and reporting back.

None of my recurring requests became a skill until the end of the project. And even a finished skill can go unused: if it only runs when invoked by name, a request phrased in everyday words never reaches it.

**Lessons for humans**
- When you type the same kind of request for the third time, stop and make it a skill. Crunch time is when you need skills most and have the least time to write them.
- Write the skill for the request as you actually phrase it, and make sure the way you normally ask actually triggers it.
- Keep revising or updating the skill after deployment if needed.

**Lessons for agents**
- Keep count of repeated requests, and propose a skill once one recurs, rather than waiting for a retrospective.
- If a request matches an existing skill that didn't trigger, say so and name the skill.

## 2. How agents should respond

I did have a global response format---details, then executive summary, then actionable items---but it isn't optimized for research.

One problem, not unique to agents, is reading the response in a conversation thread vs. reading it in a doc. The content is the same, but the two media feel very different: in a thread, reading feels rushed. I believe this is because we are used to firing off short messages in chat. A chat thread frames an impatient mindset and attention span---one that expects short messages, dislikes long text, and tends to skip it.

Length was only half the problem. The other half was what the response talked about. I kept having to ask "which line? where? change it how?", or to say that I only cared about what would change in the work itself. Agents tend to report on their own process (which files they touched, what they counted, which step did what), when what I need is a proposed change I can accept or reject.

This carries a high recurring cost, but I never dealt with it seriously. The first-order problem still seems to be length. To tackle it:

1. The primary principle is that a response in chat should never run past a set limit---I settled on 250 words, roughly a screen---and anything longer should be offloaded to a doc for review outside the chat.
2. In-chat responses follow the existing executive summary (i.e., short answer) → actionable items format.
3. The format for responses in a doc needs more thinking. Information overload is a problem there too, so it should probably be capped at a page. The format could also be pre-taxonomized: a plan (steps to take to achieve something), a diagnosis (troubleshooting a problem), a summary of actions taken, and so on.

Moving text into a doc doesn't fix the second problem, though. A dense, multi-screen report is as hard to read in a doc as it is in chat.

**Lessons for humans**
- Decide ahead of time what goes in chat and what goes in a doc, and write the rule down where the agent reads it every session.
- Give each doc type a fixed shape (plan, diagnosis, report of actions taken) and a length cap.

**Lessons for agents**
- Lead with what changes in the thing the person cares about (the paper, the product), rather than on what was done along the way.
- Make every proposal specific enough to act on: the location, the current text, and the exact replacement.
- If the answer runs past a screen, put it in a doc and leave the short answer and the next action in chat.

## 3. The tyranny of chat-centered interaction

**Chat is unwieldy for parallel workflows.** Often the agent identifies multiple issues that need further work. The natural interaction model would be a parallel one: following up on each issue in turn without losing track of the big picture. But chat is conducive only to linear workflows---you have to awkwardly open multiple threads, copy-paste the issues into them, and click back and forth between them to track progress. I ended up pasting the parallel issues into a separate text file to keep track of them by hand.

**Everything has to start with a prompt.** I often wish I could invoke the agent in ways other than typing a prompt---in particular, artifact-centered invocation, from a to-do list or from a comment on a doc. Today I have to first update the artifact (add the to-do item or the comment) and then type "hey, address that thing in that place," which is repetitive and inefficient.

One workaround was inline comments. I tagged comments in the document with a marker the agent could find, and the agent left empty comment slots wherever it wanted my input. The document became the place where issues lived, which helped with tracking, but every comment still needed a chat message to get the agent to act.

The closest thing to artifact-centered invocation was handing a task to another agent as a written instruction file, and that worked well. The instructions had to be complete enough to run without me, which also made them better instructions.

**Lessons for humans**
- Put issues in the artifact (inline comments, a task list), not only in chat, so that nothing depends on scrolling back through a thread.
- For work that can run without you, write the instructions as a file. That forces the task to be fully specified.

**Lessons for agents**
- When a response raises several issues, give each one a stable, addressable home (a comment in place, a task-list item) instead of a paragraph in chat.
- When an item has been carried forward twice, stop carrying it: ask for a decision or propose closing it.

## 4. Daily planning and the journal

The journal keeps day-to-day entries: the plan (what to work on) and the record (what actually got worked on). For me, it is a familiar place to do daily planning. A simple format made it work: I write the day's task list, and the agent adds one short section per task. One rule came from the agent itself---any session that changes files writes its section---so no work goes unrecorded.

Before the deadline rush, I used to start the day by planning and writing down a few things to achieve in the journal. Once crunch time arrived, I just jumped into whatever issue was on my mind, with no high-level planning or management. In hindsight, I should have kept planning as the deadline closed in.

<!-- What a journal does badly is keep track of *decisions*. My decisions on scope, definitions and what not to redo ended up scattered across months of entries. A separate one-line-per-decision file came only at the end. Until then, the agent sometimes reopened a question I had settled, or quietly made a decision that should have been mine, which I then had to find and reverse. -->

Reflecting on this change in my own habits, I think journal-centered daily planning is an important metacognitive step---it keeps my head clear and helps me manage my time and effort. And for the agent, the journal serves as (summarized by the agent)---

- Memory, and a hand-off. An agent remembers nothing between sessions, so the journal is how the next one---a new session, a different agent, another model---learns what was already tried, dead ends included.
- Facts that version control doesn't keep. A corrected count, a statistic that turned out to be wrong, which files are stale. Git records that a file changed, not that a number in it was wrong.
- Accountability. A claim written as "0 undefined references" or "checked line for line" is one I can check afterwards, and one the agent has to check before writing it down.
- Loose ends and provenance. Stopping mid-task leaves what is unresolved on the record instead of quietly dropping it---though carrying an item forward is cheap and closing it isn't. And if a reviewer later asks how a result was produced, this is the record behind the answer.

**Lessons for humans**
- Keep the daily planning ritual even during the deadline crunch, or especially then.
- Keep settled decisions in their own short file, dated, separate from the day-by-day log.

**Lessons for agents**
- Read the journal and the decisions file at the start of every session, rather than trusting what you remember from last time.
- When a request would reverse a recorded decision, quote the decision and ask.
- Keep journal entries short enough to be read. An entry nobody reads doesn't work as memory.

## 5. What should I be doing while the agent is working?

I have to figure out what to do while waiting, sometimes planning ahead ("I will do this later, while waiting for the agent")---reviewing the agent's previous round of edits, say, or making a decision it was waiting on. It almost feels like a scheduling problem. I wish the agent could tell me: "this is going to take a while (~X minutes); perhaps you could do Y while I am at it."

**Lessons for humans**
- Keep a short queue of review-type work (marked-up edits, open decisions) to pull from while the agent runs.

**Lessons for agents**
- Before a long task, estimate how long it will take and suggest something from the person's own queue, such as an open decision or an unreviewed pass.
- Ask the questions that could block you before starting the long work, not halfway through.

## 6. Proactive learning

Very often I had to rewrite the agent's prose, and it was frustrating to see the same patterns come back later. I probably should have called it out---"don't write things like that again"---but I was too sucked into the revision to step out of it (a recurring problem of mine as well).

We did get to this at the end: the agent distilled months of my corrections into a style guide, with each rule linked back to where it came from. It also proposed more "general" rules, most of which I rejected as too narrow or already covered.
<!-- This kind of learning can also go wrong: generic checklists for spotting AI writing flagged phrases in text I had written myself. An agent learning from such a checklist without asking would end up rewriting my own voice. -->

What I really want is for the agent to learn from this proactively. At commit time, it could compare my edits against its own version of the text, curate the telling examples (especially the ones where I reverted its changes), and propose generalizable lessons it can implement---an update to its skills or rules---with me filtering which ones to keep.

**Lessons for humans**
- Spend a minute after a correction to say whether it's a one-off or a rule. That's much cheaper than repeating the correction ten times.

**Lessons for agents**
- Compare your drafts with the person's final text at commit time. Propose rules only for patterns that repeat, each with its examples.
- Let the person approve each rule, and learn their voice from their own text, not from generic checklists.

## 7. Verification: what the agent caught, and what it got wrong

Some of the most valuable moments came from the agent checking before acting, or before claiming something was done:

- When the environment was in a surprising state (a repository that suddenly looked empty, for example), stopping to find out why prevented a routine step from destroying history.
- An automated rule that passed a small test was dropped after a check against my earlier rulings showed it contradicted many of them. The small test had looked good only because its reference data was out of date.
- Recomputing numbers instead of copying them turned up a wrong statistic and a silent bug in a figure script.
- A second agent, told to work blind, stopped on its own when it realized it had already seen the answers.

The failures went the other way. When a lookup service was down, the agent filled in reference details from memory, breaking a rule we had already agreed on. What both halves have in common is that I couldn't tell from the response which one I was getting: "verified" and "filled in from memory" read exactly the same in chat. Only claims stated in a checkable form let me tell the difference without redoing the work myself.

**Lessons for humans**
- Ask for "done" claims in a form you can check ("0 undefined references", "compared line by line"), and spot-check them.
- For judgment-heavy work, a second, independent pass by a different model is cheap. Where the two consistently disagree, it exposes each model's systematic biases.

**Lessons for agents**
- Before acting on a surprising state, find out why it happened.
- Never fill in facts from memory. Leave a visible gap instead.
- Say when a validation is weaker than it looks.

## 8. Sizing the request

I tend to send requests both small and large---fixing a layout glitch vs. running a literature search to verify a claim---through the same chat box, in the same tone. Scale also decides whether a request is worth doing at all. Under deadline pressure, I sometimes asked for polish whose value was about to disappear, such as fine layout fixes on a draft whose layout was going to change anyway. The agent carried them out without saying so.

Assessing the scale of a request is something I need to get better at too. The fix is to escape the conversation mindset when the request warrants it.

**Lessons for humans**
- Before sending a request, decide whether it's a quick fix, a task, or a project, and pick the medium to match: chat, a journal task, or a written plan.

**Lessons for agents**
- Before starting, say how big the job is ("this is a 20-minute pass over every figure").
- Say when the work is not worth its cost, and why.

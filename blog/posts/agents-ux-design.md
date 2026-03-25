# Agents, UX, and UX Design: A Co-evolution

At CHI 1997, Pattie Maes and Ben Shneiderman held a historic [debate](https://dl.acm.org/doi/10.1145/1120212.1120281) on whether the future of HCI would be dominated by intelligent software agents or user-controlled direct manipulation. The significance of that debate was not to determine a winner, but to clarify the tension—and the potential balance—between the two paradigms. [Mixed-initiative interaction](https://doi.org/10.1145/302979.303030) later emerged as a productive middle ground.

Nearly 30 years later, we appear to have arrived at the future Maes envisioned: an age of intelligent agents.

Regardless of implementation, agents are computer systems that can “decide for themselves what they need to do in order to satisfy their design objectives” (Wooldridge, 1999). Today, many of the most prominent agents are powered by large language models (LLMs). These agents can write, ideate, reason, architect codebases, generate UI mock-ups, and even [take control of a user’s screen](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool) to act on their behalf.

These capabilities are driving fundamental paradigm shifts. This article examines these changes from a co-evolutionary perspective: how agents are changing UX design practices, how agents are reshaping UX itself, and how these shifts in UX will in turn transform the future of UX design.

---

## How Agents Are Changing UX Design

UX designers are increasingly practicing [*design-in-code*](https://www.philmorton.co/how-vibe-engineering-will-turn-the-product-design-process-and-tooling-upside-down/): instead of authoring static mockups, designers describe intent to LLM agents, which generate UI code–a process dubbed as [“vibe coding”](https://www.merriam-webster.com/slang/vibe-coding).

[Some teams report](https://creatoreconomy.so/p/inside-claude-code-how-an-ai-native-actually-works-cat-wu) designers opening pull requests—often with AI assistance—rather than limiting their contribution to mockups and specs. The boundary between design and implementation has started to dissolve.

There are several appeals to design-in-code.

First, vibe coding produces high-fidelity artifacts. Certain interactions—animations, keyboard controls, touch behavior—are better explored in code than in static mockups. Generating them directly avoids costly reimplementation and validates real constraints earlier.

Second, centering on code reduces handoff friction. Traditional workflows required creating artifacts in tools like Figma and then translating them into production code, along with substantial coordination overhead. Design-in-code repositions the starting point closer to production, yet currently still facing multiple layers of hurdles, such as fitting the company’s tech stack and passing code reviews.

Third, because most industry design projects are incremental (“n-to-n+1”), working directly within the existing codebase is often more practical than producing detached prototypes.

Yet concerns are rising. Traditional UX workflows—user-centered design, the double-diamond process, iterative prototyping—assume that designers begin with low-fidelity exploration, examine multiple directions, and only later converge toward implementation. Design-in-code appears to shortcut that process.

Does starting in high fidelity lure designers toward “getting the design right” before [“getting the right design”](https://doi.org/10.1145/1124772.1124960)? Does it encourage [climbing local maxima](https://doi.org/10.1145/1357054.1357074)?

Such concern is understandable because it equates tool with process. Because agents can generate code, we assume they are suited only for the implementation phase.

But tool evolution does not necessarily remove the need for exploration. The arrival of computer-aided design (CAD) tools dramatically reduced the time required to move from concept to production. Rather than eliminating design exploration, CAD primarily changed the medium and speed of iteration within the existing workflow.

UX design has experienced something similar. When Figma replaced sketching, it did not eliminate iteration—it changed the medium of iteration. Now vibe coding may be doing something similar to Figma: enabling rapid exploration through functional prototypes rather than mock-up representations.

The question is not whether agents are wreaking havoc on UX design. The question is whether we use them to augment the right workflow. Rather than using agents to write production code, UX designers should prioritize writing [*discovery code*](https://www.uxtools.co/blog/discovery-code-and-new-bottlenecks)—rapid, exploratory implementations that serve the same purpose that sketches once did.

Meanwhile, agents are not only changing how we design UX—they are beginning to change the nature of UX itself. What may be more concerning—and often overlooked—is that we are using advanced agentic tools to design yesterday’s interfaces.

---

## How Agents Are Changing UX

For decades, UX has largely revolved around graphical user interfaces (GUIs) built on the assumption that the human user is responsible for performing the task.

Agents disrupt this assumption.

Increasingly, applications incorporate conversational agents as a primary interface component. Google’s AI Mode is gradually taking over the conventional search interface. Shopify’s “Sidekick” allows merchants to manage stores via natural language instead of navigating dashboards.

We are moving toward an era of *chat-native* interfaces, where conversation becomes the primary mode of interaction and conventional GUIs become secondary. With such interfaces, some tasks may shift from step-by-step navigation toward agent-mediated tool calls behind the scenes—while GUIs remain essential for review, control, and exception handling. A recent example is [Notion’s agent](https://www.notion.com/blog/introducing-notion-3-0) that can bypass GUI to execute multi-step workflows on users’ behalf.

GUI does not disappear though. Chat-native interfaces will remain mixed-initiative. Users still confirm calendar events, compare travel itineraries, or select among product options. When more manual user input is needed, agents may generate GUI elements on the fly.

We are already seeing early versions of this. In early AI Mode experiences, Google search can return query-specific layouts that may include structured elements—such as custom charts or tables—alongside narrative text. The exact presentation varies by query and rollout and is generated on the fly, by agents.

At the same time, the perceived stability of GUI-based workflows may continue to erode as agents become better at anticipating user intent. In many non-critical situations, an agent that can reliably predict a user’s next action may simply execute it without requiring explicit confirmation. Analogous to autocorrection for text entry, if an agent can anticipate the correct action accurately enough, users may tolerate the occasional mistake rather than manually performing the task themselves.

As UX becomes agent-centered, the practice of UX design must expand beyond front-end surface construction.

---

## How the Change of UX Will Change UX Design

Traditional applications distinguish clearly between front-end and back-end. UX has historically focused on the front-end. On agent-enabled chat-native interfaces, that boundary blurs. UX becomes entangled with the entire system stack. Training data, model alignment, safety mechanisms, feedback interpretation—all influence UX.

This blurring also affects professional roles. Designers, engineers, and product managers will increasingly operate in overlapping spaces. Design-in-code and agent-assisted development encourage more generalist “builder” roles.

If UX design does persist as a distinct discipline, its focus may shift toward helping users express intent to agents.

Agent capabilities are evolving rapidly. The [bottleneck](https://doi.org/10.1145/3613904.3642754) may soon be humans’ instructions rather than agents’ execution. An analogy lies in touchscreen evolution: sensing resolution improved dramatically, but human “fat fingers” limited precision. As agents become more capable, humans’ ability to specify what they want may become the constraint.

Future UX design may therefore center on enabling intent formulation and clarification—instrumenting mechanisms for users to provide comprehensive instructions, or guiding users through protocols that help them articulate goals.

When manual control is needed, end-users will interact with agent-generated GUIs on the fly. End-users may, in effect, “vibe code” their own interfaces through conversation, just like what designers are doing today. Techniques we develop today to support designers in vibe coding may become tools for end-users tomorrow.

Agents will continue to play an indispensable part in UX designers’ toolbox, except they will not remain passive code generators. As code editors and design tools cross-pollinate, we may see the emergence of collaborative environments where agents are embedded partners rather than external assistants. Agents will participate in broader project activities: market research, requirement synthesis, cross-functional discussion. By the time a designer prompts an agent, the agent may already possess substantial contextual knowledge about the project.

---

## Conclusion

We are at a moment of co-evolution.

Agents are changing *how* we design.

More fundamentally, they are changing *what* we design.

If UX originally existed to help humans perform tasks on computers, what happens when humans seldom perform those tasks themselves?

The future of UX design may no longer be about creating direct manipulable GUIs. Its mission lies in shaping the behavior of agents that act in our stead—and, most importantly, helping humans overcome our own limitations in harnessing the ever-growing agentic capabilities.
# Important Problems for HCI

Richard Hamming—the mathematician and computer scientist at Bell Labs—had a habit of sitting at lunch tables with chemists and asking a simple question: *What are the important problems in your field?*

He believed that to maximize impact, one must work on important problems. But to do that, you first need clarity on what those problems actually are. That turns out to be deceptively difficult.

In every field, there are plenty of reasons people end up working on problems that are not especially important in a broader sense. Some topics are trendy. Some are convenient continuations of past work. Some are simply personal interest. All of this is understandable. But it breeds complacency. It’s easy to stay busy without ever stepping back to ask whether the problems we’re working on truly matter to the field.

### The Challenge of Identifying Important Problems in HCI

So what *are* the important problems in HCI?

I think HCI faces two additional challenges in answering Hamming’s question.

The first challenge is about intellectual ownership. For a problem to count as a field’s “important problem,” it usually draws on that field’s unique intellectual core—something other fields don’t already have. In physics, this might be unifying gravity and quantum mechanics. In computer science, it might be artificial general intelligence.

HCI, however, is fundamentally interdisciplinary. It is symbiotic with other fields, borrowing and building on ideas from cognitive science (user modeling), psychology (human-subject studies), programming languages and graphics (UI development), and more. As a result, HCI rarely gets to claim problems that are *exclusively* its own in the way physics or core CS sometimes can.

This means that to answer Hamming’s question, HCI needs a slightly different interpretation of what counts as a “problem.”

Even if we set this aside, there is a second challenge. HCI is extremely diverse. Different subcommunities are likely to identify very different problems as important. That may be fine at the individual level, but at the field level it's not. To borrow Hamming’s metaphor, if everyone is steering the ship in a different direction, the net result may be that the ship goes nowhere.

### Expanding the Scope of HCI Problems

One way to address both challenges is to expand the scope of what we consider HCI’s problems.

One option is to look toward adjacent fields. For example, AI is adjacent to HCI and sits within the broader umbrella of computer science. Researchers working on “human–AI interaction” might ask: *What are the important problems in AI or CS that I, as an HCI researcher, can meaningfully contribute to solving?*

But this approach will eventually run into the same underlying issue: HCI’s intrinsic diversity, which makes it difficult to reach consensus on what the relevant adjacent fields even are.

So perhaps we need to go broader. Much broader.

What if HCI oriented itself around problems that matter at the level of humanity as a whole? Problems like climate, health, education, or scientific progress. The question then becomes: *How can HCI uniquely and meaningfully contribute to solving these problems?*

Is this too ambitious? I don’t think so. Nearly all humanity-level problems today involve people interacting with increasingly powerful computing technologies, including AI. If that’s the case, HCI is not just relevant—it’s essential.

### Tackling Problems in an HCI Way: Three Fundamental Questions

If HCI is to contribute to these broader problems, what are the foundational building blocks it brings to the table?

What follows reflects my own research perspective and biases, but I believe these ideas have broader relevance.

Any HCI problem involves humans using some form of computing technology—technology that is increasingly intelligent, which raises three fundamental questions:

**Q1. The Assimilation Question:** How can humans and technology assimilate each other's intent and reasoning?

**Q2. The Alignment Question:** How can the inner workings of a technology align with humans' values?

**Q3. The Augmentation Question:** How can technology be instrumented to augment human abilities?

These questions form a full interaction cycle.

It begins with the human expressing intent—through text, speech, gestures, or other means—in a way that technology can take up and reason about (Q1a: assimilating human intent). This is not just a matter of parsing input, but of making the human’s goals legible to the system’s internal reasoning.

Once intent is assimilated, the technology’s reasoning must proceed in a way that both advances that intent and aligns with human values (Q2). For example, if a user wants help improving a piece of writing, the system should pursue that goal without plagiarizing others’ work, thereby respecting values such as integrity.

How the technology is instrumented to act on that reasoning determines whether it merely produces better output or genuinely augments the human (Q3). A system might rewrite the text directly, or it might surface suggestions, alternatives, and explanations that help the user improve the writing themselves. The latter reflects an augmentation-oriented instrumentation, where the goal is to expand the user’s ability rather than replace it.

Finally, the technology must externalize its reasoning and results in a form the human can assimilate (Q1b). This might involve highlighting changes, explaining why certain edits were made, or otherwise making the system’s reasoning legible—so that the exchange between human and technology remains meaningful, not opaque.


### A Case Study: HCI for Scientific Discovery

To make this concrete, I’ll briefly describe how I came to work on one such problem: supporting scientific discovery.

Why scientific discovery? Because it is undeniably important. Many of humanity’s biggest leaps—Newton’s laws, Darwin’s theory of evolution, penicillin, the discovery of DNA, and more recently AI—came from scientific breakthroughs. As a species, we owe much of our progress to science.

But past success does not guarantee future discovery. As we take on harder challenges—extending human healthspan, addressing complex diseases, or exploring space—we can’t assume that simply repeating historical scientific practices will suffice. We need to improve how science itself is done.

This is not something scientists can solve alone. Other forces need to join in. AI is one of them. HCI should be another.

<!-- #### Example: Drug Target Identification -->

One of our projects focuses on drug discovery, specifically the early step of target identification—figuring out which proteins are promising places for a drug to intervene.

Take Alzheimer’s disease as an example. The protein Tau is well known to be involved, but it has been difficult to target directly. As a result, researchers often look beyond Tau to other proteins that are biologically related to it—proteins that influence how Tau behaves or how the disease progresses, and that may be easier to target with drugs.

Doing this well requires balancing several considerations at once: whether a protein is relevant to the disease, whether changing its behavior is likely to help, and whether it is practical to design a drug that acts on it. In practice, these questions are often explored using different tools and workflows, making the process fragmented and time-consuming.

In our formative studies, we found that these criteria are typically analyzed in isolation, using different tools. Scientists move back and forth between simulations, databases, and literature searches, manually maintaining a mental or external list of promising targets.

This creates an opportunity for HCI.

Our approach brings these criteria together in a single tool. We use a protein interaction graph as the central representation: edge thickness encodes physical interaction strength, node color encodes docking potential, and additional layers capture therapeutic relevance.

The visualization itself is not revolutionary. It resembles earlier tools for exploring paper citation networks or social graphs. What’s interesting is that drug target identification had not previously been framed this way. Once you see it as a multi-criteria exploration problem, the solution becomes surprisingly straightforward.

We also leverage advances in language models to support the therapeutic criterion. Instead of requiring exhaustive manual literature searches, we use LMs to retrieve and synthesize evidence from research papers about how pairs of proteins interact therapeutically. These pairwise insights are then combined to produce a more holistic assessment.

Crucially, this automation remains grounded in actual evidence. When results are presented to scientists, they are accompanied by references and explanations, not just opaque scores.

This research illustrates how HCI can address the Augmentation Question in the important domain of scientific discovery. The tool instruments AI to augment how scientists reason across multiple criteria, navigate the space of drug targets, and converge on informed decisions.

### Closing Thoughts

Unlike fields with a tightly defined intellectual core, HCI’s symbiotic and interdisciplinary nature calls for a different strategy. Rather than defining “important problems” narrowly within its own boundaries, HCI can contribute by engaging with problems that matter in a broader context—potentially at the scale of humanity—by addressing three foundational questions: Assimilation, Alignment, and Augmentation, which together shape how humans interact with computing technology.

Hamming’s question, simple as it was, reportedly annoyed many of the chemists he asked—so much so that he eventually became unwelcome at their lunch table. The discomfort was understandable. Being asked what truly matters in a field is harder than being busy within it.

I’ll never have the chance to have lunch with Hamming. But if I did, I hope I’d be able to answer his question—not with a single problem, but with a way of thinking about what makes a problem worth working on, and how I’m trying to


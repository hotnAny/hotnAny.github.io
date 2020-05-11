
[//]: # "# Did You Mean Compare or Correlate? Identifying Intent in Visual Analytical Conversations"

## One Sentence
This paper presents findigns from a Wizard-of-Oz study with users asking questions to perform a visual analytical task, and proposes a model to break down users' various intents, and how such intents can be mapped to different states of a visualization, which informs how a visualization should respond and react to users' natural language conversations.

## More Sentences
* This paper is about mapping intent to different visualizations and the transitions in between.

* The Wizard-of-Oz study was based on a 2x2 of four conditions: (w/, w/o intent) x (w/, w/o context). 
> "... varying by how intelligently the wizard responded to user intent in utteranes and whether or not the wizard considered the current context (i.e., visualization state)"
** W/ intent means the wizard will manipulate the visualization to meet the user's intent; w/o intent means the visualization will follow prescribed rules (rather than reacting to users' intent);
** W/ context means an utterance will be interpreted with its context (whenever possible); w/o context means each utterance will be interpreted independently.

## Key Points
### Literature
> "Existing literature about intent deduction can be classified into two categories: intent for search in information retrieval systems and intent for analytical tasks in visualization systems."

The information retrieval side:
> "Broder introduced a high level taxonomy of search intent by categorizing search queries into three categories: navigational, informational and transactional"

The visual analytics side:
> "... none of these systems attempt to infer user intent; they rely either on data characteristics alone or on explicit task descriptions that can be cumbersome to create."

### The conversational transitional model
<add image of figure 4>
> "The key insight of our model is that the transitional states need to be applied to all elements of the visualization state (attributes, transformations, filters, and encodings), not just to filters."

> "An intelligent conversational system will need to infer a user's transitional goals based on their actions, translate these to transitional states, and then update the visualization components accordingly."

### The unexpected system behavior
..., which was intereprted from participants' reaction to the wizard's work on the vis
* Vis states

  * unexpected schema (attribute?): didn't not infer the right attribute from a query
  * unexpected transformations: e.g., "did younger women survive better than older women?"; expected two bins (young and old) but instead got all age bins
  * unexpected filters: failures to in/exclude data or not providing filter controls
  * unexpected encodings: returning an unwanted/undesired chart type

* Transitions: "... either desired context from the prior state was lost, or undesired context was retained."

Comparison of conditions
* C4 (intent, context) had the least unexpected system behaviors, retries and resets
* C3 (intent, no context) had the most unexpected system behaviors, retries and resets

### Intent deduction
> "A session occurs when a user issues multiple utterances consecutively to a NL interface in the pursuit of satisfying one or more visual analysis needs."
> "Discourse chunks are minimal syntactic units that when chained sequentially in a given discourse or conversation, express a common purpose by the user"
> "Discourse markers are used to indicate boundaries of a chunk to identify a change in transition of the topic."

### Supporting transitions
> "An equally important aspect is maintaining coherence in the visual encoding, as abrupt changes to the way data is represented can be jarring and easily misinterpreted."
> "Explicit or implicit intent may conflict with the goal to maintain visual encoding coherence between states."

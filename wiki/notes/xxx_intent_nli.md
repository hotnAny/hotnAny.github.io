
[//]: # "# Did You Mean Compare or Correlate? Identifying Intent in Visual Analytical Conversations"



## One Sentence

* This paper is about mapping intent to different visualizations and the transitions in between.

## More Sentences
* The Wizard-of-Oz study was based on a 2x2 of four conditions: (w/, w/o intent) x (w/, w/o context). 
> "... varying by how intelligently the wizard responded to user intent in utteranes and whether or not the wizard considered the current context (i.e., visualization state)"
** W/ intent means the wizard will manipulate the visualization to meet the user's intent; w/o intent means the visualization will follow prescribed rules (rather than reacting to users' intent);
** W/ context means an utterance will be interpreted with its context (whenever possible); w/o context means each utterance will be interpreted independently.

## Key Points
Literature
> "Existing literature about intent deduction can be classified into two categories: intent for search in information retrieval systems and intent for analytical tasks in visualization systems."

The information retrieval side:
> "Broder introduced a high level taxonomy of search intent by categorizing search queries into three categories: navigational, informational and transactional"

The visual analytics side:
> "... none of these systems attempt to infer user intent; they rely either on data characteristics alone or on explicit task descriptions that can be cumbersome to create."

The conversational transitional model
<add image of figure 4>
> "The key insight of our model is that the transitional states need to be applied to all elements of the visualization state (attributes, transformations, filters, and encodings), not just to filters."

> "An intelligent conversational system will need to infer a user's transitional goals based on their actions, translate these to transitional states, and then update the visualization components accordingly."

The unexpected system behavior, which was intereprted from participants' reaction to the wizard's work on the vis
* Vis states

  ** unexpected schema (attribute?)
  ** unexpected transformations
  ** unexpected filters
  ** unexpected encodings

# Interacting meaningfully with machine learning systems: Three experiments

```
@article{stumpf2009interacting,
  title={Interacting meaningfully with machine learning systems: Three experiments},
  author={Stumpf, Simone and Rajaram, Vidya and Li, Lida and Wong, Weng-Keen and Burnett, Margaret and Dietterich, Thomas and Sullivan, Erin and Herlocker, Jonathan},
  journal={International Journal of Human-Computer Studies},
  volume={67},
  number={8},
  pages={639--662},
  year={2009},
  publisher={Elsevier}
}
```

## One Sentence
This paper describes three experiments to explore how users react to different ways of explaining machine learning in an email classification scenario, what kinds of feedback they provide, and how (well) this feedback can be incorporated to improve machine learning's performance.

> "Taken together, the results of our experiments show that supporting rich interactions between users and machine learning systems is feasible for both user and machine."

## More Sentences
The research questions
> "RQ 1. How can machine learning systems explain themselves such that (a) end users can understand the system’s reasoning, and (b) end users are willing to provide the system rich, informative feedback with potential to improve the system’s accuracy?
RQ 2. What types of feedback will end users give? That is, how might we categorize the nature of their feedback from the perspective of machine learning, and what sources of background knowledge underlie users’ feedback?
RQ 3. Can these types of user feedback be assimilated by existing learning algorithms? If so, exactly how could some of these types of user feedback be incorporated into machine learning algorithms, and does doing so actually improve the performance of algorithms?"

## Key Points
####Motivation
> "... little research into how end users might interact with machine learning systems, beyond communicating simple 'right/wrong' judgments."

####Prior work
> "Prior work has focused on linear additive models that associate a weight with each feature and produce a result by summing up these weighted features."

> "These computationally expensive explanation algorithms for Bayesian networks consist of finding the subset of evidence that most influences the posterior probability and visualizing the flow of evidence through the network during inference."

> "These approaches to explanation are purely intended to illustrate the system's behavior to the end user and abstract away from the actual details of the underlying algorithm."

####Active learning
> "An active learning algorithm operates in a loop in which the first step is to ask the user to label a training instance that would provide the most information regarding the classification task. Once the label is provided by the user, the active learning algorithm updates its parameters with the new training instance and the loop continues if the accuracy of the classifier is still unsatisfactory."

Characteristics/drawbacks: 1) interact with the user through labels (only); 2) the user needs to provide a large number of labels. Labels are too low-level; a high-level feedback could save the time to collect many labels.

####Expressing domain knowledge
> "[approach #1] ... qualitative monotonicities, which allow statements such as 'higher values of X are more likely to produce high values of Y' ... [approach #2] polyhedral knowledge sets, which describe regions of the input space that are known to contain classes of data points ... [approach #3] ... [domain knowledge as constriant in] a constraint-based approach"

####Experiment 1
> "... three explanations of each result ... a Rule-based, a Keyword-based, and a Similarity-based explanation"

> "... users found this latter set of 'negative' words counter-intuitive." Confusing if we show negative features that lead to negative results?

> "... the Rule-based explanation paradigm was the most understandable"

> "Shallow understanding ... means that participants were simply able to make the classification decision the same way as the [machine]"



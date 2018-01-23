# Interactive machine learning for health informatics: when do we need the human-in-the-loop?

```
@article{holzinger2016interactive,
  title={Interactive machine learning for health informatics: when do we need the human-in-the-loop?},
  author={Holzinger, Andreas},
  journal={Brain Informatics},
  volume={3},
  number={2},
  pages={119--131},
  year={2016},
  publisher={Springer}
}
```

## One Sentence
This article describes interactive machine learning, and in several case studies argues how it can be uniquely useful in health informatics.

## Key Points
Machine learning in general

* "According to Tom Mitchell [11], a scientific field is best defined by the questions it studies: ML seeks to answer the question 'How can we build algorithms that automatically improve through experience, and what are the fundamental laws that govern all learning proceses?"
* "The challenge is to discover relevant structural patterns and/or temporal patterns ('knowledge') in such data, which are often hidden and not accessible to the human expert."

Interactive machine learning

* "We define iML-approaches as algorithms that can interact with both computational agents and human agents and can optimize their learning behavior through these interactions."

When will human-in-the-loop be beneficial (to health informatics)?

* When there is no explicit representation of knowledge, e.g., diagnostic radiologic imaging ("... medical doctors can often make diagnoses with great reliability--but without being able to explain their rules explicitly.")
* When data integrity is often unideal or compromised, e.g., having a lot of noise, missing attributes, not having sufficient samples, high dimensionality
* When it is not a labeling problem (for ML) and there is no obvious closed-form solution (e.g., protein folding)
* [Summary] "These examples demonstrate that human experience can help to reduce a search space of exponential possibilities drastically by heursitic selection of samples, thereby helping to solve NP-hard problems efficiently--or at least optimize them acceptably for a human end-user."

Origins and fundamentals of interactive ML

* Reinforcement learning "is a branch of ML concerned with using experience gained through interacting with the world and evaluative feedback to improve te ability of a system to generate behavioral decisions"
* Preference learning "is aming to learn a predictive preference model from observations (emprical data) that reveal, explicitly or implicitly, information about specific preferences of a user or a group of users."
* Active learning "is that an ML-algorithm can achieve greater accuracy with fewer training labels, ... where unlabeled data may be abundant or easily obtained, but labels are difficult, time-consuming, or expensive to obtain."

## Take-Away

* The type of human-in-the-loop discussed in this paper is similar to crowdsourcing, where humans "play computer" to bring in insights unavailable in traditional ML/AI methods. How about putting end-users in the loop? Imagine a doctor uses an AI-powered diagnosis system, what could happen? What if the system produces contradictory/counter-intuitive results? How can the end-user (doctor) makes sense of the results? How can the end-user correct the system by, for example, providing a new piece of expertise to the system's reasoning process? On the other hand, what if the system is right? How can the doctor look into the reasoning process and find out what he/she is missing?
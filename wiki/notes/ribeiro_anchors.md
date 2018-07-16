# Anchors: High-precision model-agnostic explanations
```
@inproceedings{ribeiro2018anchors,
  title={Anchors: High-precision model-agnostic explanations},
  author={Ribeiro, Marco Tulio and Singh, Sameer and Guestrin, Carlos},
  booktitle={AAAI Conference on Artificial Intelligence},
  year={2018}
}
```

## One Sentence
This paper proposes a method to sample training data and generate sufficiently accurate explanation of an intelligent system's behavior.

> "An anchor explanation is a rule that sufficiently "anchors" the prediction locally -- such that changes to the rest of the feature values of the instance do not matter."

## More Sentences
Instead of individual features for explanations, find a set of key features (i.e., anchors) that yield high accuracy of local predictions. In other words, simplify complex models to a set of simple rules that work for a subset of the data.

## Key Points
> "In a user study, we show that anchors enable users to predict how a model would behave on unseen instances with less effort andhigher precision"

> "A question at the core of interpretability is whether humans understand a model enough to make accurate predictions about its behavior on unseen instances"

> "While such explanations rovide insight into the model, their coverage is not clear, e.g., when does "not" have a positive influence on sentiment?"
![https://www.dropbox.com/s/3i3ot52qvj4onym/anchors.png?dl=0]

## Take-Away
* Globally-interpretable machine learning models: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5108651/

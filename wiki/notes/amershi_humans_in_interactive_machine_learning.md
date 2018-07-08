# Power to the people: The role of humans in interactive machine learning

```
@article{amershi2014power,
  title={Power to the people: The role of humans in interactive machine learning},
  author={Amershi, Saleema and Cakmak, Maya and Knox, William Bradley and Kulesza, Todd},
  journal={AI Magazine},
  volume={35},
  number={4},
  pages={105--120},
  year={2014}
}
```

## One Sentence
This article presents several case studies to advocate the approach of interactive machine learning that involve humans in a rapid, focused and incremental manner.

## Key Points
Domain-experts have little control over how intelligent systems work
> "However, potential users of such applications, who are often domain experts for the application, have limited involvement in the process of developing them."

Example of how ML practicioners and domain experts collaborate
> "The project lead recounted their experience in an invited talk at the Intelligent User Interfaces’s 2013 Workshop on Interactive Machine Learning (Amershi et al. 2013). First, the practitioners would create a clustering of the protein structures. Then, they would meet with the biochemists to discuss the results. The biochemists would critique the results (for example, “these two proteins should / should not be in the same cluster” or “this cluster is too small”), providing new constraints for the next iteration. Following each meeting, the practitioners would carefully adjust the clustering parameters to adhere to the given connstraints and recompute clusters for the next meeting."

How is interactive machine learning different?
> "In contrast, model updates in interactive machine learning are more rapid (the model gets updated immediately in response to user input), focused (only a particular aspect of the model is updated), and incremental (the magnitude of the update is small)"

People Naturally Want to Provide More Than Just Data Labels:
> "The authors found that people naturally provided a wide variety of input types to improve the classifier’s performance, including suggesting alternative features to use, adjusting the importance or weight given to different features, and modifying the information extracted from the text. These results present an opportunity to develop new machine-learning algorithms that might better support the natural feedback people want to provide to learners, rather than force users to interact in limited, learner-centered ways."

The fallacy of involving users too much ---
> "Cakmak’s study (figure 3) found that the constant stream of questions from the robot during the interaction was perceived as imbalanced and annoying. The stream of questions also led to a decline in the user’s mental model of how the robot learned, causing some participants to “turn their brain off” or “lose track of what they were teaching”"

Users tend to interact with intelligent systems in unexpected ways:
> "... to provide guidance to the agent about future actions, rather than actual feedback about previous action"
While labeling a happened action is natural from a machine learning point of view; it is not for a human, as human would try to guide a successful future action rather than dwelling on what went wrong in the previous trial.

## Take-Away
About Fails and Olsen's Crayon: Image segmentation seems innately amenable to providing expert feedback (i.e., by painting over pixels); some other domain knowledge (e.g., how a patient should be assessed) is less explicit.

Human experts might reflect on their own performance, knowledge and skills when interacting with machine learning.

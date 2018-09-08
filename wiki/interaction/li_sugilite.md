# SUGILITE: creating multimodal smartphone automation by demonstration

```
@inproceedings{li2017sugilite,
  title={SUGILITE: creating multimodal smartphone automation by demonstration},
  author={Li, Toby Jia-Jun and Azaria, Amos and Myers, Brad A},
  booktitle={Proceedings of the 2017 CHI Conference on Human Factors in Computing Systems},
  pages={6038--6049},
  year={2017},
  organization={ACM}
}

```

## One Sentence
This paper presents SUGILITE--a programming-by-demonstration, voice-activated agent that can automatically execute tasks on a mobile device.

> "By leveraging the verbal instructions, the demonstrated procedures, and the apps' UI hierachiy structures, SUGILITE can automatically generalize the script from the recorded actions"

## Key Points
Examples
> "... 'find the flights from New York to Los Angeles', SUGILITE identifies 'New York' and 'Los Angeles' as two parameters if the user typed 'New York' into the departure city textbox and 'Los Angeles' into the destination textbox during the demonstration."

> "... if the user demonstrated ordering a venti Cappuccino with skim milk by saying the command 'order a Cappuccino', we will discover that 'Capppuccino' is a parameter, but not 'venti' or 'skim milk'"

> "[the list] has two options 'Cappuccino' and 'Iced Cappuccino'. SUGILITE will first identify 'Cappuccino' as a parameter, and then add 'Iced Cappuccino' to the set as an alternative value for the parameter, allowing the user to order Iced Cappuccino using the same script."

The NLP aspect:
> "... Learning by Instruction Agent ... The LIA uses a Combinatory Cateogrial Grammar (CCG) parser to parse the verbal command."

## Take-Away
* Two important notions: each action is a series of events; users should be able to fork an action. It could use a tree representation.

* Programming-by-demonstration not applicable for website with very infrequent visits.

* The approach assumes very little a prior knowledge but almost always requires programming by demonstration (unless it is familar to or forkable from prior script).

* Limitation: doesn't know what belongs to and what does not belong to a list (menu), e.g., including 'store location' with the variety of coffee.

* Limitation: can't handle changes of UI layout, or an app that shows up in a different state than the one used for demonstration.

* SUGILITE uses a ```try```/```catch``` mechanism to handle error, which is also extensible by the user.

* Limitation: can't handle web application because it is a different ecosystem
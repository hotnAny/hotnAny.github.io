# Eviza: A Natural Language Interface for Visual Analysis

```
@inproceedings{setlur2016eviza,
  title={Eviza: A natural language interface for visual analysis},
  author={Setlur, Vidya and Battersby, Sarah E and Tory, Melanie and Gossweiler, Rich and Chang, Angel X},
  booktitle={Proceedings of the 29th Annual Symposium on User Interface Software and Technology},
  pages={365--377},
  year={2016},
  organization={ACM}
}
```

## One Sentence
This paper describes an interface that allows people to use natural language to interact with the visualization, such as asking "find large earthquakes near California", whereby the interface will zoom into California and filter earthquake location markers using a magnitude threshold.

It advocates a type of visualization interface whereon a user asks a question, and the system manipulates itself so that it appears more insightful towards answering the user's question

![alt text](https://i.imgur.com/zgS0WAX.png "Eviza screenshot")

## More Sentences
"We introduce Eviza, a natural language interface for visual data analysis. Eviza enables a user to have an interactive conversation with their data by emphasizing the ability for a user to continually revise and update their queries in an iterative way to create a 'dialog' with the visualization."

Features of Eviza:

* A set of grammatical rules based on an initial study of what questions users ask to visualizations.
* Parsing a user question and interacting with the visualization accordingly;
* Allowing for syntactic and semantic ambiguity, e.g., "happy" to {"HappyLifeYears", "HappyPlanetIndex"}, "large" (earthquakes) to the magnitude of earthquakes.
* Autocompletion based on what attributes are available in the current data set as well as the ranges of value, helping users complete a query as well as learning how to ask questions.

## Key Points
Why natural language is good for querying and discovering data?
>"This approach is promising, as users may be able to express their questions more easily in natural language rather than translating those questions to appropriate system commands (exposed through a query language or interface widgets ".

>"... much less research has investigated natural language interaction with existing visualizations."

>"... people often specify what they want imprecisely, leaving out details such as dimension names of how to map those dimensions to visual encodings within a chart."

The current multi-modal style of Eviza: 
>"... e.g., radial selection in a map; asking 'what's the distribution of earthquakes here'"

## Take-Away and Questions
* What's the typical 'depth' of conversations? How many turns in turn-taking?
* Need semantic analysis of each word in a question before applying any grammatical rules?
* Direct manipulation seems very minimum, maybe because of the nature of the task?
* 'Large' is mapped to 'magnitude' (data attribute) and 'near' to a filtering operation?
* What happens if a query parsing fails? What should Eviza do next besides restarting a new trial?

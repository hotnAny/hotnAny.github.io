# Natural language with integrated deictic and graphic gestures

```
@inproceedings{neal1989natural,
  title={Natural language with integrated deictic and graphic gestures},
  author={Neal, Jeannette G and Thielman, CY and Dobes, Zuzanna and Haller, Susan M and Shapiro, Stuart C},
  booktitle={Proceedings of the workshop on Speech and Natural Language},
  pages={410--423},
  year={1989},
  organization={Association for Computational Linguistics}
}
```

## One Sentence
This paper describes a system that combines natural langauge and deictic gestures to facilitate object selection in a multi-media environment.

## More Sentences
"... NL processing technology that incorporates deictic and graphic gestures with simultaneous coordinated NL for both user inputs and system-generated outputs."

"... use simultaneous pointing and NL references to disambiguate one another when appropriate ..."

## Key Points
Seems necessary to have both domain knowledge and interaction knowledge:
> "This knowledge base includes information about concepts such as SAMs, air bases, radars, and missions as well as related HCI concepts such as verbal/graphical expressions for the domain concepts"

Discussed the benefits of different modalities:
> "One of the benefits of this multimodal langauge is that it eliminates the need for the lengthy definite descriptions that would be necessary for unnamed objects if only natural language were used."

Very relevant to the first cell in the design space
> "(1) a point gesture can be ambiguous if the point touches the area where two ore more graphical figures or icons overlap or (2) the user may inadvertently miss the object at which he intended to point."

Almost the most representative example of this system
![fig1](https://dl.dropbox.com/s/2l62cbt35dfhmz8/neal_1989_fig1.png?dl=0)

Other features of the system:
* Indirect filtering, "What is the mobility of these <point1> <point2> <point3>?": 'mobility' as an attribute filters the selection of what the user is pointing at.
* The system has the semantics of objects being selected, e.g., "Enter this <point-to-A> here <point-to-B>" will enter A (a template of an object) into B (a field in a form)
* When pointing doesn't hit any (meaningful) targets, the system will incrementally search in the vicinity of the pointed area.

## Take-Away
* The output part is at best visual/textual feedback for user input
* Learn about GATN: https://www.cse.buffalo.edu/sneps/epia89.ps
* How modalities synchronize: "to what degre are gestures of different types not synchornized with their corresponding NL phrase, how frequently does the phenomenon occur, is there a correlation between characteristics of the phenomenon and characteristics of the corresponding natural language"

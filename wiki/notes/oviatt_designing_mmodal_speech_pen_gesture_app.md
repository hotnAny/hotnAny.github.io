# Designing the user interface for multimodal speech and pen-based gesture applications: state-of-the-art systems and future research directions

```
@article{oviatt2000designing,
  title={Designing the user interface for multimodal speech and pen-based gesture applications: state-of-the-art systems and future research directions},
  author={Oviatt, Sharon and Cohen, Phil and Wu, Lizhong and Duncan, Lisbeth and Suhm, Bernhard and Bers, Josh and Holzman, Thomas and Winograd, Terry and Landay, James and Larson, Jim and others},
  journal={Human-computer interaction},
  volume={15},
  number={4},
  pages={263--322},
  year={2000},
  publisher={Taylor \& Francis}
}
```
## One Sentence
...

> "... we summarize the emerging architectural approaches for interpreting speech and pen-based gestural input in a robust manner-including early and late fusion approaches, and the new hybrid symbolic-statistical approach."

## Key Points
> "To date, multimodal systems that combine either speech and pen input ... or speech and lip movements ... consititute two major research areas within the field."

#### Where speech is beneficial/useful?
> "Users tend to prefer speech for functions like describing objects and events, sets and subsets of objects, out-of-view objects, conjoined information, and past and future temporal states, as well as for issuing commands for actions or iterative actions. ... During multimodal pen-voice interaction, users tend to prefer entering descriptive information via speech, although their preference for pen input increases for digits, symbols, and graphic content ..."
> "For example analysis of the linguistic content of users' integrated pen-voice constructions has revealed that basic subject, verb, and object constituents almost always are spoken, whereas those describing locative information invariably are written or gestured."

#### Five ways a multimodal approach facilitates error recovery
1. Users will select the mode they judge to be less error-prone ("for particular lexical content");
2. Users' language is simplified when interacting multimodally, makinig it easier for NLP and reducing errors;
3. "Third, users have a strong tendency to switch modes after system errors, which facilitates error recovery.";
4. Users report less subjective frsutration when interacting multimodally;
5. Well architectured, a system can support mutual-disambiguation ("Mutual disambiguation involve recovery from unimodal recognition errors within a multimodal architecture because semantic information from each input mode supplies partial disambiguation of the other mode, thereby leading to more stable and robust overall system performance."

#### Benefits of speech + pen
* Permit flexible use of input modes, including alternation and integrated use.
* Support improved efficiency, especially when manipulating graphical
information.
* Can support less disfluent, shorter, and more linguistically simplified
constructions than a speech-only interface, which results in more robust
NLP.
* Support greater precision of spatial information than a speech-only interface,
because pen input conveys rich and precise graphical information.
* Satisfy higher levels of user preference.
* Support enhanced error avoidance and ease of error resolution.

#### Early approach
> "Many early multimodal interfaces that handled combined speech and gesture, such as Bolt's (1980) Put That There system, were based on a control structure in which multimodal integration occurred during the process of parsing spoken langauge. When the user spoken a deictic expression, such as 'here' or 'this', the system would search for a synchronized gestural act that designated the spoken referent."

Two ways to jointly process input signals
* "Feature level" (early fusion) looks at low-level, raw sources of signals "mixed" together, e.g., multiple Hidden Markov Models;
* "Semantic level" (late futions) first recognize and derive meanings from each sources and combine them later.

> "... such a (feature-level) system tends to not apply or generalize as well if it consists of models that differ substantially in the information content of time-scale characteristics of their features."

#### Sychrony of speech and gesture
> "... users' multimodal speech and gesture constructions can involve either sequentially integrated or simultaneously delivered signal pieces"
> "Empirical work on speech and gesture input has established that users' written input precedes speech during a sequentially integrated multimodal command"

#### Architectural requirements for processing multiple input modes:
* Parallel recognizers and interpreters that produce a set of time-stamped meaning fragments for each continuous input stream
* A common framework for representing meaning fragments derived from multiple modalities
* A time-sensitive grouping process that determines when to combine individual meaning fragments from each modality stream.
* Meaning fusion operations that combine semantically and temporally compatible meaning fragments.
* A data-driven statistical process that enhances the likelihood of selecting the best joint interpretation of multimodal input.
* A flexible asynchronous architecture that permits multiprocessing, keeps pace with user input, and potentially handles input from multiple simultaneous users.
* A multimodal interface design that combines complementary modes in a synergistic manner, thereby yielding significant levels of mutual disambiguation between modes and improved recognition rates.

#### Difference in processing input signals between GUI and multimodal systems
1. Simultaneity: "... for many multimodal interfaces, the need to process simultaneous input from different streams will be the norm";
2. Uncertainty: involving natural human behaviors, thus using "probabilistic methods of processing".

#### Architecture of a multimodal system
![multimodal architecture](https://dl.dropbox.com/s/6ger5okjfw2s3uu/multimodal_architecture.jpg?dl=0)

#### Multimodal agents ...
... solve the problem of different components of a multimodal system might have been written in different programming languages, deployed on different machines running different OS, etc.

#### Hybrid architecture
A hybrid architecture processes an assortment of signals together, individual or multiple of them. Member-Team-Committee is one such approach:
* Members deal with input signals from different modes;
* Members make up different teams (one member can belong to multiple teams), where each team applies different weights to combine different members' input
* Teams make up Committee, which applies different weights to combine different teams' input
* All the weights can be computed from training data

![mtc](https://dl.dropbox.com/s/sgnocpgqfw5ht82/members-teams%3Dcommittee.jpg?dl=0)

> "The primary difference between this integration approach and the conventional approach is that in conventional approaches the probability of the merged FSs is the cross-product of the probabilities of individual FSs. In the approach presented here, the probability of the merged FS is the weighting interpolation of the probabilisties of individual FSs"

#### Speech and gesture applications
* QuickSet: "... a medical unit could be created at a specific location and orientation by saying 'medical company facing this way <draw arrow>.'"
* IBM Human-Centric Word Processor (HCWP):
  
  * "Example 1: 'Delete this word <point to word>'"
  * "Example 2: 'Change this date to the third <point to date>'"
  * "Example 3: 'Underline from here to there <point to start and end of text line>'"
  * "Example 4: 'Move this sentence here <points to sentence and new location>.'"
  
  "In Example 2, the user only needs to point in the vicinity of a date for the system to understand which text elements are involved."
  
  Interesting problem that is worth attention: "All systems like HCWP that support the use of speech for dictation and commands face the problem of categorizing each utterance correctly as dictated text or as a command. Some systems employ a 'modal' approach with the application in either dictation or command mode."
  
* Boeing's VR Aircraft Maintenance Traning Prototype: "When working in the VR environment, the user can decide when to gesture and when to speak and can use these modes alone or in combination. For example, the user can point to an object and say, "Give me that." Alternatively, if the object is distant, occluded, or otherwise out of view, she might say, 'Hand me the socket wrench'."

* NCR's Field Medic Informatoin System, addressing domain specific problem: "The system was designed to address field medics' current difficulty using paper forms to document patient care rapidly and accurately, especially under emergency circumstances when their eyes and hands must be devoted to assessing and treating the patient."

  Another scenario: "... tapping on neck graphic while speaking a description of the injury"
  
* BBN'S Portable Voice Assistant: "... an online vehicle repair manual and parts-ordering system, for which the intended users are army personnel repairing field equipment. For mobile applications such as this, in which the user's visual attention and hands are occupied, speech input and output are particularly attractive."
  
  "The PVA can interpret simultaneous pen-voice input so, for example, the user can say 'Show me that part' while pointing at a screw on the display."

  Other application areas: "point-of-sale purchase records, medical diagnostics, and in-car navigation systems."
  
#### Future work
* "... although the field is developing rapidly, there are not yet commercially available systems of this type. To reach this goal, more general, robust, and scalable multimodal architectures will be needed."

# Synergic use of direct manipulation and natural language

```
@inproceedings{cohen89synergic,
  title={Synergic use of direct manipulation and natural language},
  author={Cohen, PR and Darlymple, M and Pereira, FCN and Sullivan, JW and Gargan Jr, RA and Schlossberg, JL and Tyler, SW},
  booktitle={Proc. Conf. human Factors in Computing Systems (CHI'89)},
  pages={227--233}
}
```

## One Sentence
This paper describes a system that synergically uses direct manipulation and natural language, including resolving anaphoric ambiguity, refering to pointed objects to enable deixis, and using form filling to structure the natural language command.

## Key Points
Several statements on what direct manipulation (DM) and natural language (NL) are good for respectively.
> "Natural language helps direct manipulation in being able to specify objects and actions by description, while direct manipulatino enables users to learn which objects and actions are available in the system"

> "Direcrt manipulation is appropriate when the task is such that a limited number of actions can be taken at a given time, and the objects to which the actions are applied can be made visible on the screen in a coherent fashion. Natural language is particularly appropriate for describing objects and time periods that cannot be referred to directly (e.g., in environments in which it is inconvenient or impossible to provide screen representation of all user options)"

NL's weakness
> "Another often-cited weakness of 'pure' natural langauge systems is the opacity of the system's linguistic and conceptual coverage. Although users know the system cannot understand everything, they do not know precisely what it can understand"

DM's weakness 
* Lack of ability to describe an object or further actions upon it beyond simply selecting it;
* Hierarchiy of visual elements make it difficult for navigation.

Resolving anaphoric ambiguiity: "where was board 1 then" -- by using DM to select a specific interval, "then" is resolved to that interval.
![](https://dl.dropbox.com/s/x21bpffsfk3t7a6/cohen_synergistic_direct_manipulation_natural_language_1.png?raw=1 =400x)

Representing the discourse as a tree so that users can select specific utterances to define custom contexts
![](https://dl.dropbox.com/s/rksy39anvftzgn1/cohen_synergistic_direct_manipulation_natural_language_2.png?raw=1)

Pointing and deixis
> "'How many boards were processed at these [rework1] [rework2] stations?' To produce this query, the user first typed, 'How many boars were processed at these' in to the natural-language input window. The user then selected two stations from the graphic depiction of the factory floor, and so that names of these stations were inserted into the query."

Natural-language form
"... (1) invoking MOVE from a menu, (2) typing the description 'each board at a down machine' to the **what** prompt, and (3) pointing at the relevant destination machine, typing 'here', and (4) 'depositing' the selected machine into the **to** slot."

## Take-Away
* We can survey prior work and provide stats on how much of it falls into the design space.
* The tree representation can potentially be added to viva voce's tool for users to add context to an utterance.
* A lot of the interaction in the described system seems like switching between DM and NL, which seems very cumbersome, and steps backwards compared to DM or NL alone.

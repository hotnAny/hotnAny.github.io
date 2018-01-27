# QuickSet: Multimodal Interaction for Distributed Applications

```
@inproceedings{cohen1997quickset,
  title={QuickSet: Multimodal interaction for distributed applications},
  author={Cohen, Philip R and Johnston, Michael and McGee, David and Oviatt, Sharon and Pittman, Jay and Smith, Ira and Chen, Liang and Clow, Josh},
  booktitle={Proceedings of the fifth ACM international conference on Multimedia},
  pages={31--40},
  year={1997},
  organization={ACM}
}
```

## One Sentence
This paper describes QuickSet--an infrastructure for interpreting and unifying multimodal inputs (pen/voice) across applications distributed to different devices (hand-held and desktop PCs).

## More Sentences
This paper contributes "a new unification-based mechanism for fusing partial meaning representation fragments derived from the input modalities."

## Key Points
#### Why does multimodal have to do with distributed applications across devices?
> "A major design goal for QuickSet is to provide the same user input capabilities for handheld, desktop, and wall-sized terminal hardware. We believe that only voice and gesture-based interaction comfortably span this range."

#### The application examples:
* Leathernet. 
> "For example, to create a unit in QuickSet, the user would hold the pen at the desired location and utter: “red T72 platoon” resulting in a new platoon of the specified type being created."
* Multimodal control of virtual travel. 
> “take me to objective alpha” "fly me to this platoon &lt;gesture on QuickSet map&gt;" "fly me along this route &lt;draws route on QuickSet map&gt; at fifty meters"
* ExInit. Users can create different types of units by naming them (perhaps with more descriptive information) while providing spatial information (e.g, position/orientation) by drawing

<br>
#### Something that direct manipulation cannot do:
> "Spoken interaction with virtual worlds offers distinct advantages over direct manipulation, in that users are able to describe entities and locations that are not in view, can be teleported to those out of view locations and entities, and can ask questions about entities in the scene."

#### Temporal and semantic compatibility for unification
* Temporal compatibility
> "... when users speak and gesture in a sequential manner, they gesture first, then speak within a relatively short time window; speech rarely precedes gesture. As a consequence, our multimodal intpreer prefers to integrate gesture with speech that follows within a short time interval, than with preceding speech. If speech arrives after that interval, the gesture will be interpreted unimodally."
* Semantic compatibility

  * ... is achieved through "typed feature structure"
  * > "A feature structure consists of a collection of feature-value pairs"
  * > "When two feature structures are unified, a composite structure containing all of the feature specifications from each component structure is formed."

#### Advantages of typed feature structure unification
* **Partial meaning representation**. Each input mode is interpreted by partially filling in a feature structure, e.g., "barbed wire" will fill in the ```object``` feature but leave the ```location``` feature vacant; later a drawn line will be interpreted and used to complete the ```location``` feature.

* **Multimodal compensation**. Once a feature structure is partially filled (e.g., "barbed wire"), it filters  subsequent interpretation (e.g., preferring interpreting user drawing as a line rather than a point).

* **Structure sharing**. Adjacent feature structures can share certain features, e.g., "M1A1 platoon facing this way &lt;draw arrow&rt;" shares the ```orientation``` feature with the subsequent drawing.

* **Multimodal discourse**
>"The user can explicitly enter into a 'mode' in which s/he is creating a specific type of entity, for example, M1A1 platoons, by simply saying 'multiple M1A1 platoons'"


#### The need to overload modes
> "Not surprisingly, it readily became apparent that spoken interaction with QuickSet would not be feasible. To suport usage in such a harsh environment, a complete overlap in functionality between speech, gesture, and direct manipulation was desired."

## Take-Away
* Need to look for application scenario in which conventional GUI is inferior to eithe speech or gesture, and speech or gesture alone is inferior to them combined.
* Similar to other systems, the use of speech never escaped identifying an object (identification) with only symbolic meaning.
* Two things are reusable: 1) the temporal relationship between modes; 2) the feature structure for unification.
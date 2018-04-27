# Building an application framework for speech and pen input integration in multimodal learning interfaces

```
@inproceedings{vo1996building,
  title={Building an application framework for speech and pen input integration in multimodal learning interfaces},
  author={Vo, Minh Tue and Wood, Cindy},
  booktitle={Acoustics, Speech, and Signal Processing, 1996. ICASSP-96. Conference Proceedings., 1996 IEEE International Conference on},
  volume={6},
  pages={3545--3548},
  year={1996},
  organization={IEEE}
}
```

## One Sentence
This paper describes a framework for jointly interpreting multimodal input signals by merging semantic frames, and maintaining context by merging temporally adjacent frames

<img src="https://dl.dropbox.com/s/723owq6aqb3a1ws/vo_interpretation_using_frames.png?raw=1" width="360px"></img>

## Key Points
#### The calendar interaction scenario
> "A person using our Jeanie multimodal calendar can employ any combination of spoken input, gesturing with a pen on a touch-sensitive screen, or handwritten words to interact with the system. In typical scenarios, the user might say 'Schedule a meeting on Monday' while at the same time drawing a box on the calendar to indicate where the new meeting should be inserted; write words on the newly scheduled meeting to annotate it; draw a cross on another meeting to cancel it; or point to a meeting and say 'Reschedule this on Tuesday' or simply draw an arrow from that meeting to the new time slot on Tuesday.'"

#### Towards human-like communication
> "Human communication is very natural and flexible because we can take advantage of a multiplicity of communication signals working in concert to supply complementary information or increase robustness with redundancy"

#### Two main technical contributions
> "A multimodal interpretation engine jointly interprets information from all inpt sources by merging semantic frames. A domain-independent dialog processor maintains context information across inpout events."

#### Frame merging
> "Frames are merged by taking the union of the sets of values filling each slots and adding corresponding scores."

#### Preferences of modalities
This is different from Oviatt's finding: 
> "In the pilot tests it was observed that some subjects prferred to use gestures more often, some preferred speech, others mixed the two."

## Take-Away
Some take-away from the "state-of-the-art" performance evaluation

* Gesture annd handwriting recognition was worse than speech recognition
* Adding more modalities reduces errors
* Despite recognition errors, multimodal interaction still provides users with the correct interpretation amongst choosable options

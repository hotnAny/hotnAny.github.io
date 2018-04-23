# “Finger-Pointer”: Pointing interface by image processing

```
@article{fukumoto1994finger,
  title={“Finger-Pointer”: Pointing interface by image processing},
  author={Fukumoto, Masaaki and Suenaga, Yasuhito and Mase, Kenji},
  journal={Computers \& Graphics},
  volume={18},
  number={5},
  pages={633--642},
  year={1994},
  publisher={Elsevier}
}
```

The main thing to learn from this paper is how it synchronizes voice commands and gestures.

## One Sentence
This paper describes a image processing based system for recognizing various hand gestures in tandom with voice commands.

"We have developed an experimental system for the 3D direct pointing interface 'Finger-Pointer,' which can recognize finger pointing actions and simple hand forms in real-time by processing the image sequences captured by stereoscopic TV cameras."

## Key Points
A taxonomy of gestures:
* locator: indicating 2D or 3D location
* switcher: selecting between two or more states
* valuator: indicate quantity (e.g., "about *this* size")
* imager: visualizes shapes, actions or feelings (e.g., "triangle", "running")

Benefits of using voice in addition to gestures
* The combination of finger and voice provides more natural interaction than just hand gestures. For example, using voice allows the operator's hand to be raised just briefly for pointing so fatigue is less than occurs with thumb-switching triggering."

## Take-Away
The "timing tags" approach to solve the problem that processing voice commands creates latency: the idea is to time-stamp when a voice command is received, and upon finishing processing it we can trace back to when it was spoken, which served as the indicative time as to how to syncronize it with other input modalities.

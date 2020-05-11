# Augmenting a window system with speech input

```
@article{schmandt1990augmenting,
  title={Augmenting a window system with speech input},
  author={Schmandt, Chris and Ackerman, Mark S. and Hindus, Debby},
  journal={Computer},
  volume={23},
  number={8},
  pages={50--56},
  year={1990},
  publisher={IEEE}
}
```

## One Sentence
This paper introduced Xspeak, an application that allows for using speech to manage windows in the XWindow System, such as saying the window names to switch between windows in focus, as well as speaking further commands to subsequently perform interaction in the window in-focus, such as button press.

"With Xspeak, window navigation tasks usually performed with a mouse can be controlled by voice. A new version, Xspeak II, incorporates a language for translating spoken commands."

## Key Points
The benefit of using speech in the X Window System
> "Thus, a user can manage a number of windows without removing his or her hands from the keyboard."

When might speech input be useful in a workstation?
> "The evidence suggests that voice input is more valuable in conjunction with other input devices (such as keyboard and mouse). Judging by the successful industrial applications of speech recognition, in which the user perform an activity in parallel, we surmised that allowing users to remian focused on the screen and keybaord, instead of fumbling for the mouse, would be beneficial in a workstation evironment."

Speech can express something higher level (representing a group of windows)
> "Speech, then, could let users employ many task-specific windows"

How the interaction work sfor Xspeak:
> "Speaking a window's template pops the window to the foreground and moves the mouse pointer to the middle of the window"

Even for tasks expected to be faster with speech, there are "edge cases" that turn out to be the opposite. It is important to discuss such "edge cases' rather than ignoring "sampling biase".
> "For simple change-of-focus tasks (moving the moues from one exposed window to another exposed window), speech was not faster than the mose"

Is "navigation" generalizable?
> "Navigation in a window system *can* be handled with speech input."

Even a good technique might not be easier to initiate if considered in the context of a continuous sequence of interaction
> "Having a hand already on the moues accounted for 59 percent of the times users navigated with the mouse rather than with Xspeak."

Interesting that some users had behavior change
> "Toward the end of the observation period, we noticed that the users most inclined to use voice increased the number of overlapping windows or the degree of overlap"

## Take-Away
> "Having a hand already on the moues accounted for 59 percent of the times users navigated with the mouse rather than with Xspeak."
Speech input is difficult to segment: is such context helpful in determining the prior probablity of speech coming next in the input sequence?

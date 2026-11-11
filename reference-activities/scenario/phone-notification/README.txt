The Samsara clip lives at:

  video/driver-distracted-by-phone.mp4

index.html points at that exact path (see the <source> tag). If the file is
absent or fails to load, the interaction falls back to the drawn cab scene and
still works end to end.

The clip is never interrupted. It plays from the first frame to the last, holds
on the final frame, and only then does the question appear. There is no
mid-clip freeze point to configure.

The stage is framed at 1920 x 760 and the clip is cropped to fill it
(object-fit: cover). The expand control in the top-right corner opens the clip
full screen; inside full screen the clip letterboxes instead of cropping, so
nothing is lost. If the page is embedded in an iframe without `allowfullscreen`
(Storyline sometimes does this), the control instead expands the clip to fill
the whole web object, and Esc closes it.

Shortcut while reviewing: press N during the clip to jump straight to the end.
The clip seeks to its last frame and the question appears immediately, exactly
as if you had watched the whole thing. Works on the drawn fallback scene too.

The interaction is a single phone-notification scenario. After the decision, the completion
layer sets the Storyline variable DriveComplete to true. Selecting "Review the scenario"
dismisses the layer and restarts the activity from the watch phase.

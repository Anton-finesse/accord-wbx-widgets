# accord-wbx-widgets: wrapup-bell

 * Widget that plays a beep sound on eAgentWrapup event.
 * Uses Web Audio API to ensure sound plays even if the tab is not focused.
 * User must enable audio by toggling the switch first.
   
 * This is version 0.3, with improved audio context handling using (!) audio buffer caching.
 * Property "audioPath" is added to set the audio file path in the Webex Desktop Layout json.
#
    "area": {
      "advancedHeader": [
        {
          "comp": "wrapup-bell",
          "script": "path to the webcomponent wrapup-bell",
          "properties": {
            "audioPath": "path to the bell audio file"
          }
        }
    ]} 

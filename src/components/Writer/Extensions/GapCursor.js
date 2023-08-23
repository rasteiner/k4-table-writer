import { gapCursor } from "prosemirror-gapcursor";
import Extension from "../Extension";

import "prosemirror-gapcursor/style/gapcursor.css"

export default class GapCursor extends Extension {
  get name() {
    return "gapcursor";
  }
  plugins() {
    return [
      gapCursor()
    ];
  }
}

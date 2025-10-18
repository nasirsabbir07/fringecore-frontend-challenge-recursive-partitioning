import { useReducer } from "react";
import Pane from "./components/Pane";
import { randomColor, uid } from "./utils/utils";

const initialState = {
  id: uid(),
  color: randomColor(),
};

/**
 * Design Notes:
 * - Used a recursive component tree structure to model pane splits.
 * - State managed via useReducer for predictable updates.
 * - Ratio and resizing handled through dispatched actions.
 * - No external layout libraries; pure flexbox + Tailwind.
 */

function reducer(state, action) {
  // --- helper functions declared once per reducer call ---
  function splitNode(node, id, direction) {
    if (node.id === id) {
      // turn leaf into split
      return {
        id: node.id,
        direction,
        ratio: 0.5,
        children: [
          { id: uid(), color: node.color },
          { id: uid(), color: randomColor() },
        ],
      };
    }
    if (!node.children) return node;
    return { ...node, children: node.children.map((child) => splitNode(child, id, direction)) };
  }

  function removeNode(node, id) {
    if (!node.children) return node;
    const [a, b] = node.children;
    if (a.id === id) {
      return { ...b };
    }
    if (b.id === id) {
      return { ...a };
    }
    return { ...node, children: node.children.map((child) => removeNode(child, id)) };
  }

  function setRatio(node, id, ratio) {
    if (node.id === id && node.children) {
      const snaps = [0.25, 0.5, 0.75];
      const snapThreshold = 0.03;
      let final = ratio;
      for (const s of snaps) {
        if (Math.abs(ratio - s) <= snapThreshold) {
          final = s;
          break;
        }
      }
      return { ...node, ratio: Math.max(0.05, Math.min(0.95, final)) };
    }
    if (!node.children) return node;
    return { ...node, children: node.children.map((child) => setRatio(child, id, ratio)) };
  }

  // --- switch logic ---
  switch (action.type) {
    case "SPLIT": {
      const { id, direction } = action.payload;
      return splitNode(state, id, direction);
    }

    case "REMOVE": {
      const { id } = action.payload;
      return removeNode(state, id);
    }

    case "SET_RATIO": {
      const { id, ratio } = action.payload;
      return setRatio(state, id, ratio);
    }

    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div className="w-screen h-screen flex ">
      <Pane node={state} dispatch={dispatch} isRoot={true} />
    </div>
  );
}

export default App;

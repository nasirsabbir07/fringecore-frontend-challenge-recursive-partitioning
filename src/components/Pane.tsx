import { useRef } from "react";

function Pane({ node, dispatch, isRoot = false }) {
  if (!node.children) {
    return (
      <div className="relative flex-1 h-full min-w-0" style={{ background: node.color }}>
        <div className="flex items-center justify-center h-full gap-1">
          <button
            className="bg-white/70 px-2 rounded text-sm shadow"
            onClick={() =>
              dispatch({ type: "SPLIT", payload: { id: node.id, direction: "vertical" } })
            }
            title="Split vertically"
          >
            v
          </button>
          <button
            className="bg-white/70 px-2 rounded text-sm shadow"
            onClick={() =>
              dispatch({ type: "SPLIT", payload: { id: node.id, direction: "horizontal" } })
            }
            title="Split horizontally"
          >
            h
          </button>
          {!isRoot && (
            <button
              className="bg-white/70 px-2 rounded text-sm shadow"
              onClick={() => dispatch({ type: "REMOVE", payload: { id: node.id } })}
              title="Remove pane"
            >
              -
            </button>
          )}
        </div>
      </div>
    );
  }

  const isVertical = node.direction === "vertical";
  const [a, b] = node.children;
  const ratio = typeof node.ratio === "number" ? node.ratio : 0.5;

  return (
    <div
      className={`flex ${isVertical ? "flex-row" : "flex-col"} flex-1 min-h-0 min-w-0 relative`}
      style={{ height: "100%", width: "100%" }}
    >
      <div
        className="min-w-0 min-h-0"
        style={{ flexBasis: `${ratio * 100}%`, flexGrow: 0, flexShrink: 0 }}
      >
        <Pane node={a} dispatch={dispatch} isRoot={false} />
      </div>

      {/* Divider */}
      <Divider node={node} dispatch={dispatch} isVertical={isVertical} />

      <div className="min-w-0 min-h-0" style={{ flex: 1 }}>
        <Pane node={b} dispatch={dispatch} isRoot={false} />
      </div>
    </div>
  );
}

function Divider({ node, dispatch, isVertical }) {
  const ref = useRef(null);

  function onMouseDown(e) {
    e.preventDefault();
    const root = ref.current.parentElement;
    const rect = root.getBoundingClientRect();
    const startPos = isVertical ? e.clientX : e.clientY;
    const size = isVertical ? rect.width : rect.height;
    const startRatio = typeof node.ratio === "number" ? node.ratio : 0.5;

    function onMove(ev) {
      const curPos = isVertical ? ev.clientX : ev.clientY;
      const delta = curPos - startPos;
      // compute new ratio relative to root
      let newRatio = (startRatio * size + delta) / size;
      newRatio = Math.max(0.05, Math.min(0.95, newRatio));
      dispatch({ type: "SET_RATIO", payload: { id: node.id, ratio: newRatio } });
    }

    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      className={`flex items-center justify-center ${
        isVertical ? "cursor-col-resize" : "cursor-row-resize"
      }`}
      style={{
        width: isVertical ? 8 : "100%",
        height: isVertical ? "100%" : 8,
        background: "linear-gradient(90deg, rgba(255,255,255,0.1), rgba(0,0,0,0.06))",
        zIndex: 10,
        flexGrow: 0,
        flexShrink: 0,
      }}
    ></div>
  );
}

export default Pane;

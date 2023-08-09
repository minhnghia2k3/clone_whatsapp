import React, { useEffect, useRef } from "react";

function ContextMenu({ options, coordinates, contextMenu, setContextMenu }) {
  const contextMenuRef = useRef(null); // useRef references a value that not needed to be re-rendered

  const handleClick = (e, callback) => {
    e.stopPropagation(); // Prevents event from bubbling up the DOM tree,
    setContextMenu(false);
    callback();
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.id !== "context-opener") {
        if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
          setContextMenu(false);
        }
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    }
  }, [])

  return (
    <div
      className={`bg-dropdown-background fixed py-2 z-[100] shadow-xl`}
      style={{
        top: coordinates.y,
        left: coordinates.x
      }}
      ref={contextMenuRef}>
      <ul>
        {
          options.map(({ name, callback }) =>
          (
            <li className="px-5 py-2 cursor-pointer hover:bg-background-default-hover" key={name} onClick={(e) => handleClick(e, callback)}>
              <span className="text-white">{name}</span>
            </li>
          ))
        }
      </ul>
    </div>
  )
}

export default ContextMenu;

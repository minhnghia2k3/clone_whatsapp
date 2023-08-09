import React from "react";
import ReactDOM from "react-dom";

function PhotoPicker({ onChange }) {
  const component = (<input type="file" hidden id="photo-picker" onChange={onChange} />)
  // Create a portal to render the component in the div from (_document.jsx) id="photo-picker-element"
  return ReactDOM.createPortal(component, document.getElementById('photo-picker-element'))
}

export default PhotoPicker;

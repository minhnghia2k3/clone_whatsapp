import React from "react";

function Input({ name, state, setState, label = false }) {
  return <div className='flex flex-col gap-1'>
    {label &&
      (<label htmlFor={name} className="text-teal-light text-lg px-1">
        {name}
      </label>)}
    <input
      name={name}
      value={state}
      onChange={(e) => setState(e.target.value)}
      className="bg-input-background text-start focus:outline-none text-white rounded-lg h-10 px-5 py-4 w-full"
    />
  </div>;

}

export default Input;

import React, { useState } from 'react';

function NewTransfer({createTransfer}) {
  const [transfer, setTransfer] = useState(undefined);

  // We need to create a submit funciton
  const submit = e => {
    // we want to first prevent a full page reload that happens by default
    e.preventDefault();
    createTransfer(transfer);
  }

  // we need to make an updateTransfer function that accepts two things: the event and the field we are interested in
  const updateTransfer = (e, field) => {
    // First we need to extract the value from the event object
    const value = e.target.value;
    // then we update the transfer state using setTransfer function
    // we create a new object by destructuring the transfer object
    // and we want to set the field dynamically w/o knowing the name of the field in advance
    setTransfer({...transfer, [field]: value});
  }

  return (
    <div>
      <h2>Create Transfer</h2>
      <form onSubmit={e => submit(e)}>
        <label htmlFor="amount">Amount</label>
        <input
          id="amount"
          type="text"
          onChange={e => updateTransfer(e,'amount')}
        />
        <label htmlFor="to">To</label>
        <input
          id="to"
          type="text"
          onChange={e => updateTransfer(e, 'to')}
        />
        <button>Submit</button>
      </form>
    </div>
  )
}

export default NewTransfer;

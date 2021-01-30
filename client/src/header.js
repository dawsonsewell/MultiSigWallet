import React from 'react';

// create a funciton and put in the props we are interested in
function Header({approvers, quorum}) {
  return (
    <header>
      <ul>
        <li>Approvers: {approvers.join(', ')}</li>
        <li>Quorum: {quorum}</li>
      </ul>
    </header>
  )
}

export default Header;

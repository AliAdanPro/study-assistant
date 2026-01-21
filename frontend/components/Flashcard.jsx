```javascript
import React from 'react';

const Flashcard = ({ question, answer, flipped, onClick }) => {
  return (
    <div className="flashcard" onClick={onClick}>
      {flipped ? answer : question}
    </div>
  );
};

export default Flashcard;
```
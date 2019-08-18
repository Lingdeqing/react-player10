import React from 'react';
import Video from "./components/Video";

function App() {
  return (
    <div className="App">
      <div className="wrap">
        <ul>
          <li>1</li>
          <li>2</li>
          <li>3</li>
          <li>1</li>
          <li>2</li>
          <li>3</li>
          <li>1</li>
          <li>2</li>
          <li>3</li>
          <li>1</li>
          <li>2</li>
          <li>3</li>
          <li>1</li>
          <li>2</li>
          <li>3</li>
        </ul>
        <Video scrollClassName="App"/>
        <div onClick={() => alert(1)} className="btn">click</div>
      </div>
    </div>
  );
}

export default App;

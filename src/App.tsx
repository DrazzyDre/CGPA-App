import React from 'react';
import CGPACalculator from './components/CGPACalculator';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>CGPA Calculator</h1>
      <CGPACalculator />
    </div>
  );
}

export default App;
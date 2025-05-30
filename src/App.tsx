import { SpeedInsights } from "@vercel/speed-insights/react"
import React from 'react';
import CGPACalculator from './components/CGPACalculator';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>CGPA Calculator</h1>
      <CGPACalculator />
      <div className="powered-by">
        Powered by: <span>
          <a
            href="https://github.com/DrazzyDre"
            target="_blank"
            rel="noopener noreferrer"
          >
            DrazzyDre
          </a>
        </span>
      </div>
      <SpeedInsights />
    </div>
  );
}

export default App;
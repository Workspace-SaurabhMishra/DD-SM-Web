//src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import CodeEditor from './CodeEditor';

function App() {
  
  return (

    
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/editor" element={<CodeEditor />} />
        <Route path="/" element={<Login />} /> {/* Default route */}
      </Routes>
    </Router>
    

  );
}

export default App;

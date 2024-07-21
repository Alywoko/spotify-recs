import React from "react";
import logo from './logo.svg';
import './App.css';

function App() {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);
  
  React.useEffect(() => {
    fetch("api")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok " + res.statusText);
        }
        return res.json();
      })
      .then((data) => setData(data.message))
      .catch((error) => setError(error.message));
  }, []);
  
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>{!data ? (error ? `Error: ${error}` : "Loading...") : data}</p>
      </header>
    </div>
  );
}

export default App;

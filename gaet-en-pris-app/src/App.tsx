import React, { useState } from 'react';
import './App.css';
import { SetupComponent } from './components/SetupComponent';
import { ScoreBoardComponent } from "./components/ScoreBoardComponent";
import { IStateContext } from "./models/IStateContext";

export const StateContext = React.createContext({} as IStateContext);


function App() {

  const [isSetupPhase, setIsSetupPhase] = useState<boolean>(true);
  const [numberOfTeams, setNumberOfTeams] = useState<number>(0);
  const [numberOfRounds, setNumberOfRounds] = useState<number>(0);

  const initialState: IStateContext = {
    isSetupPhase: isSetupPhase, setIsSetupPhase: setIsSetupPhase,
    numberOfTeams: numberOfTeams, setNumberOfTeams: setNumberOfTeams,
    numberOfRounds: numberOfRounds, setNumberOfRounds: setNumberOfRounds,

  };

  return (
    <StateContext.Provider value={initialState}>
      <div className="App">
        <header className="App-header">
          { isSetupPhase ? 
          <SetupComponent/> : 
          <ScoreBoardComponent />
          }
        </header>
      </div>
    </StateContext.Provider>
  );
}

export default App;

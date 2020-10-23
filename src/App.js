import React from "react";
import "./App.css";
import TrialClass from "./component/TrialClass/TrialClass";
import { NotificationContainer } from "react-notifications";

const App = () => {
  return (
    <>
      <h2 style={{ textAlign: "center", marginTop: "30px" }}>
        Book a Free Trial Session
      </h2>
      <div className="App">
        <TrialClass />
      </div>
      <NotificationContainer />
    </>
  );
};

export default App;

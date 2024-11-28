import { useState, useEffect } from 'react';

// Singleton state and listeners array
let globalTurnState = { currentTurnId: null };
let listeners = []; // this is a global list to the useTurn hook which store all the anonymous function of every component which can be called to change their turn state when the global turn state changes, this way they will all be syncronised


const addListener = (listener) => {
  listeners.push(listener);
};

const removeListener = (listener) => {
  listeners = listeners.filter((l) => l !== listener);
};

const setGlobalTurnState = (newState) => {
  globalTurnState = { ...newState };
  // whent the globalTurnState changes I just call the function that know which component they belong to and whose turn state they should change and I call them all with the same value
  listeners.forEach((listener) => listener(globalTurnState));
};

export const useTurn = () => {
  const [turnState, setTurnState] = useState(globalTurnState);

  useEffect(() => {
    // this is essentially a function that know which component it belongs to 
    const listener = (newState) => setTurnState(newState);

    // Use explicit functions for adding/removing the listener
    addListener(listener);
    return () => removeListener(listener);
  }, []);

  const updateTurn = (id) => setGlobalTurnState({ currentTurnId: id });

  return { currentTurnId: turnState.currentTurnId, updateTurn };
};

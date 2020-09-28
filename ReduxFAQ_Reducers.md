# Redux FAQ : Reducers

- How do I share state between two reducers? Do I have to use combineReducers?
- Do I have to use the switch statement to handle actions?

## How do I share state between two reducers? Do I have to use combineReducers?

- the suggested structure for a redux store - split the state object into multiple "slices" or "domains" by key. - provide a separate reducer function to manage each individual data slice.
  => similar to the standard Flux pattern, Redux provides combineReducers utility funtion to make this pattern easier.

- _combineReducers_ is not required. it is simply a utiliy function for the common use case of having single reducer function per state slice with plain JS objects for the data.

- many users later want to try to share data between two reducers, but CombineReducers X allow them to do so.
- Several approches that can be used:

  1. If a reducer needs to know data from another slice of state, the state tree shape may need to be reorganized so that a single reducer is handling more of the data.
  2. writing some custom fucntions for handling some of these actions -> require replacing combineReducers with own Top-level reducer function.
     also, use a utilty such as _reduce-reducers_ to run combineReducers to handle most actions, but also run a more specialized reducer for specific actions that cross state slices.
  3. Async action creators (like redux-thunk) : have access to the entire state **through getState()**.<br>
     an action creator can retrieve additional data from the state, put it in an action => each reducer has enough informantion to update its own state slice.

- reducers are just functions. It's up to you to subdivide them or to organize them. Just remember and follow the basic rules of reducers.
  - (state, action) => newState
  - update state immutably rather than mutating it directly.

## Do I have to use the switch statement to handle actions?

- **NO**. welcome to use any approach. The switch statement is the most common approach, but it's okay to use if statements or any other ways.
- Redux DOES require the action objects contain a **type field**, reducer logic doesn't even have to rely on that to handle the action.
- standard approach : based on TYPE, (lookup table or switch statements)

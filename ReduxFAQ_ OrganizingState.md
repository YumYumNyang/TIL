# Redux FAQ : Organizing State

- Do I have to put all my state into Redux? Should I ever use React's setState()?
- Can I put functions, promises, or other non-serializable items in my store state?
- How do I organize nested or duplicate date in my state?
- Should I put from state or other UI state in my store?

## Do I have to put all my state into Redux? Should I ever use React's setState()?

- There's no **right** answer for this.
  Some : prefer to keep every single peice of date in Redux to maintain a fully serializable and controlled version of their application at all times.
  others: prefer to keep non-critical or UI state inside a component's internal state.

- **Using Local component state is fine.**
  It's developer's job to determine the state, and where the state should live.
- Some common rules of thumb for determining what kind of data should be put into Redux

  - Do other parts of the application care about this data?
  - Do you need to be able to create further derived data based on this original data?
  - Is the same data being used to drive multiple components?
  - Is there value to you in being able to restore this state to a given point in time?
  - Do you want to cache the date?
  - Do you want to keep this data consistent while hot-reloading UI componenets?

- there're number of packages that implement various approaches for storing per-component state in Redux store instead
  (redux-component, redux-react-local..)
- Possible to apply Redux's priciple, concept of reducers to the task of updating local component state as well
  (this.setState(prevState)=> reducer(prevstate,Action))

## Can I put functions, promises, or other non-serializable items in my store state?

- HIGHLY RECOMMENDED: only put plain serializable objects,arrs, primitives into store.
- technically possible to insert non-serializable items => Can break the ability to persist and rehydrate the contents of a store + interfere with time-travel debugging.

- Just be sure you understand what tradeoffs are involved.

## How do I organize nested or duplicate data in my state?

- Data ( with IDs, Nesting, or Relationships) -> stored in a NORMALIZED fashion.
  - each object should be stored once
  - keyed by ID
  - other objects that reference the object should only store the ID rather than a copy of the etire object.
- libiraries (normalizr, redux-orm) helps and abstract in managiing normalized data.

## Should I put form state or other UI state in my store?

The same rules of thumb for deciding what should go in the Redux store apply for this question as well.

- Based on those rules of thumb, most form state doesn't need to go into redux.

- We suggest trying these approaches in this order

  - Start by writing yout form logic by hand. -> excellent guidance on this
    https://goshakkk.name/on-forms-react/

  - If you decide that writing forms MANUALLY is too difficult-> try react-based form lib (Formik, React-Final-Form)

  - If you are absolutely sure you must use a Redux-based form library because the other approaches aren't sufficient , then you may finally want to look at Redux-form and React-redux-form.

- take some time to analyze the overall performance needs of your own application.

- Other kinds of UI sate follow these rules of thumb as well. (ex-tracking an isDropdownOpen). In most situations, the rest of the app doesn't care about this, it should stay in component state. However, depending your application, it may make sense to use Redux to manage dialogs and other popups, tabs, expanding panels, ans so on.

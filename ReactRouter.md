# Usage with React Router

- Routing with app : React Router
- Redux : source of truth for data
- React Router : source of truth for URL
- It's fine to have them separate unless there's no need to time travel and rewind actions that trigger a URL change.

## Installing React Router

- _react-router-dom_ is avilable on npm.

  ```bash
    npm install react-router-dom
  ```

## Configuring the Fallback URL

<br>

### what is fallback? ( vs callback)

- Call back

  - a return of a situation to a state. like a call with the telephone to a message of
    the phone or the answering machine to a defect of a product.
    a function or method which excuted after the current effect is finished (In coding.)

- Fall back

  - An act of falling back. like an alternative plan to the current idea, progress.
    a backup of the current data to fallback to a time stamp (In computer.)
    "PLAN B"

- <a href ="https://stackoverflow.com/questions/25377545/what-is-a-fallback/25377721">funny explaination for fallback </a>

<br>
<br>

### configuring development sever.

_Create React App won't need to configure a fallback URL.(automatically done.)_

<br>

- ### Configuring Express

  ```javascript
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
  ```

- ### Configuring WebpackDevServer
  index.html from WebpackDevServer : add to your webpack.config.dev.js
  ```javascript
  devServer: {
    historyApiFallback: true;
  }
  ```

## Connecting React Router with Redux App

- First, Import <Router /> <Route /> from React Router.
  ```javascript
  import { BrowserRouter as Router, Route } from 'react-router-dom';
  ```
- **In React app,** wrapping `<Route />`in `<Router />` <br>
  -> when the URL changes, `<Router />` will match a branch
  `<Route />` : used to declaratively map routes to your application's component hierachy. <br>
  declare path in `path` (used in URL) , <br>
  in `component`, when the route mathes URL, single component to be rendered.


    ```javascript
    const Root = () => (
        <Router>
            <Route path="/" component={App} />
        </Router>
    )
    ```

- **In Redux App**, still need `<Provider />` : higer-order component

  -> route handler can get access to the store.

   ```javascript
      import { Provider } from 'react-redux'

      const Root = ({ store }) => (
        <Provider store={store}>
          <Router>
            <Route path="/" component={App} />
          </Router>
        </Provider>
      )
   ```

- `<App />` component will be rendered when the URL matches '/.'

  - add the optional `:filter?` parameter to `/` <br>
    -> we need it when we try to read the parameter `:filter` from the URL.

  **components/Root.js**

  ```javascript
  import React from 'react';
  import PropTypes from 'prop-types';
  import { Provider } from 'react-redux';
  import { BrowserRouter as Router, Route } from 'react-router-dom';
  import App from './App';

  const Root = ({ store }) => (
    <Provider store={store}>
      <Router>
        <Route path="/:filter?" component={App} />
      </Router>
    </Provider>
  );

  Root.propTypes = {
    store: PropTypes.object.isRequired,
  };

  export default Root;
  ```

  **index.js - to render the `<Root />` component to the DOM.**

  ```javascript
  import React from 'react';
  import { render } from 'react-dom';
  import { createStore } from 'redux';
  import todoApp from './reducers';
  import Root from './components/Root';

  const store = createStore(todoApp);

  render(<Root store={store} />, document.getElementById('root'));
  ```

  <br>

## Navigation with React Router

- React Router + `<Link />` component -> let u navigate around your application. <br>

  - add style : `<NavLink />`(special link react-router-dom has) -> accepts styling props <br>
    **activeStyle** property -> apply style on the active state.

  - In our example, Wrapping `<NavLink/>` to dynamically change the URL : `<FilterLink />`

**containers.FilterLink.js**

```javascript
import React from 'react';
import { NavLink } from 'react-router-dom';

const FilterLink = ({ filter, children }) => (
  <NavLink
    exact
    to={filter === 'SHOW_ALL' ? '/' : `/${filter}`}
    activeStyle={{
      textDecoration: 'none',
      color: 'black',
    }}
  >
    {children}
  </NavLink>
);

export default FilterLink;
```

**components/Footer.js**

```javascript
import React from 'react';
import FilterLink from '../containers/FilterLink';
import { VisibilityFilters } from '../actions';

const Footer = () => (
  <p>
    Show: <FilterLink filter={VisibilityFilters.SHOW_ALL}>All</FilterLink>
    {', '}
    <FilterLink filter={VisibilityFilters.SHOW_ACTIVE}>Active</FilterLink>
    {', '}
    <FilterLink filter={VisibilityFilters.SHOW_COMPLETED}>Completed</FilterLink>
  </p>
);

export default Footer;
```

- Click on `<FilterLink />` -> URL will change between `'SHOW_COMPELETED'`, `'SHOW_ACTIVE'` and `'/'`
- Going Back to your browser : use browser's history , effectively go to previous URL.

## Reading From the URL

- currently, todolist is not filtered even after the URL changed.<br>
  -> filtering from `<VisibleTodoList />`'s `mapStateToProps()`
  _Still bound to the state , not to the URL._<br>
  Use `ownProps` (object with every props passed to `<VisibleTodoList />`)

**containers/VisibleTodoList.js**

```javascript
const mapStateToProps = (state, ownProps) => {
  return {
    todos: getVisibleTodos(state.todos, ownProps.filter),
    //state.visibilityFilter -> ownProps.filter
  };
};
```

- Right now, X passing anything to `<App/>` -> `ownProps` : empty object.<br>
  To filter todos according to the **URL**, _pass the URL params to `<VisibleTodoList />`_

- `<Route path="/:filter?" component={App} />` : made available inside App a params property.

- params property : an object with every param specified in the url with the `match` object. <br>
  (`match.params` = `{filter: 'SHOW_COMPLETED'}` -> navigating to `localhost:3000/SHOW_COMPLETED.`)

**components/App.js**

```javascript
const App = ({ match: {params} }) => {
  return (
    <div>
      <AddTodo />
      <VisibleTodoList filter={params.filter || 'SHOW_ALL'}>
      <Footer/>
    </div>
  )
}
```

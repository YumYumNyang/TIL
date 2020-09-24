import fetch from 'cross-fetch';

export const REQUEST_POSTS = 'REQUEST_POSTS';
export const RECEIVE_POSTS = 'RECEIVE_POSTS';
export const SELECT_SUBREDDIT = 'SELECT_SUBREDDIT';
export const INVALIDATE_SUBREDDIT = 'INVALIDATE_SUBREDDIT';

export function selectSubreddit(subreddit) {
  return {
    type: SELECT_SUBREDDIT,
    subreddit,
  };
}
// users select a subreddit to display

export function invalidateSubreddit(subreddit) {
  return {
    type: INVALIDATE_SUBREDDIT,
    subreddit,
  };
}
// press 'refresh' button to update subreddit

//-> these are the actions governed by the user interaction.

// actions governed by the network requests. ->

function requestsPosts(subreddit) {
  return {
    type: REQUEST_POSTS,
    subreddit,
  };
}

// To fetch the posts for subreddit. it's important to separate invalidateSubreddit and this.
// If I want to fetch some data independently of the user action ( refresh stale data once in a while ) or fetch in response to a route change
// -> it's not wise to couple fetching to some particular UI event early on.

function receivePosts(subreddit, json) {
  return {
    type: RECEIVE_POSTS,
    subreddit,
    posts: json.data.children.map(child => child.data),
    recevedAt: Date.now(), // receivedat will be some weired number it's iso8601 number.
  };
}

// export function fetchPosts(subreddit){
//     // thunk middleware knows how to handle function. it passes dispath method as an argument to the function, thus making it able to dispatch actions it self.
//     return function(dispatch) {
//         //First dispatch : the app state is updated to inform that the API call is starting.
//         dispatch(requestsPosts(subreddit))
//         // the fucntion called by the thunk middleware can return a value, that is passed on as the return value of the dispatch method.
//         // -> RETURN : a Promise to wait for.

//         return fetch(`https://www.reddit.com/r/&{subreddit}.json`)//using fetch api in this example.
//         .then(
//             response => response.json()
//             //Do not use catch, because errors occured during rendering.
//             //shoud be handled by React Error Boundaries.
//         )
//         .then( json =>
//             // dispatch manytimes : ok
//             dispatch(receivePosts(subreddit,json)) // update app state with the results of the api call.
//         )
//     }
// }

// this is thunk action creator!
// eventhough its insides are different with other action creator, it can be used like any other action creators

function fetchPosts(subreddit) {
  return dispatch => {
    dispatch(requestsPosts(subreddit));
    return fetch(`https://www.reddit.com/r/${subreddit}.json`)
      .then(response => response.json())
      .then(json => dispatch(receivePosts(subreddit, json)));
  };
}

function shouldFetchPosts(state, subreddit) {
  const posts = state.postsBySubreddit[subreddit];
  if (!posts) {
    return true;
  } else if (posts.isFetching) {
    return false;
  } else {
    return posts.didInvalidate;
  }
}
export function fetchPostsIfNeeded(subreddit) {
  // function also receives getState()-> lets you choose what to dispatch next.
  // this is useful for avoiding a network request if a cached value is already available.
  return (dispatch, getState) => {
    if (shouldFetchPosts(getState(), subreddit)) {
      return dispatch(fetchPosts(subreddit));
      // dispatch a thunk form thunk
    } else {
      return Promise.resolve();
      // let the calling code know there's nothing to wait for.
    }
  };
} //-> more shophisticated async control flow gradually, while the consuming code can stay pretty mush the same.

// async action creators are especially convenient for server rendering. Store will be hydrated with the state
// async action creators returns promise. only render after the promise. -> store will be already hydrated with the state before rendering.

// Asynchoronous middleware (redux-thunk, redux-promise) wraps the store's dispatch() method and allows u to dispatch something other(functions, promises) than actions.
// any middleware can then intercept anything u dispatch, can pass actions to the next middleware in the chain.
// (promise middleware can intercept promises and dispatch a pair of begin/end actions asynchronously in response to each promise. )
//  action that last middleware in the chain dispatches should be plain object.

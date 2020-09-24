import { combineReducers } from 'redux'
import {
    SELECT_SUBREDDIT,
    INVALIDATE_SUBREDDIT,
    REQUEST_POSTS,
    RECEIVE_POSTS
}from './actions'

function selectedSubreddit(state = 'reactjs', action) {
    switch (action.type){
        case SELECT_SUBREDDIT:
            return action.subreddit
        default:
            return state
    } 
}

function posts(
    state = {
        isFetching : false,
        didInvalidate : false,
        items: []
    },
    action
) {
    switch (action.type){
        case INVALIDATE_SUBREDDIT:
            return Object.assign({}, state,{
                didInvalidate: true
            })
        case REQUEST_POSTS:
            return Object.assign({}, state,{
                isFetching: true,
                didInvalidate: false
            })
        case RECEIVE_POSTS:
            return Object.assign({}, state,{
                isFetching: false,
                didInvalidate:  false,
                items: action.posts,
                lastUpdated : action.receivedAt
            })
        default:
            return state
    }
}
//posts(state,action) manages the state of a specific postlist
//post reducer : updating items inside object 

function postsBySubreddit(state={},action){
    switch (action.type){
        case INVALIDATE_SUBREDDIT:
        case RECEIVE_POSTS:
        case REQUEST_POSTS:
            return Object.assign({}, state, {
                [action.subreddit]: posts(state[action.subreddit],action)
                // ES6 -> state[action.subreddit] === Object.assign()
                // this is Equivalent to ..
                // let nextState = {}
                // nextState[action.subreddit] = posts(state[action.subreddit], action)
                // return Object.assign({},state,nextState)
                
            })
        default:
            return state
    }
}
const rootReducer = combineReducers({
    postsBySubreddit,
    selectedSubreddit
})

export default rootReducer

import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import rootReducer from './reducers'

const loggerMiddleware = createLogger()


export default function configureSitre(preloadedState){
    return createStore(
        rootReducer,
        preloadedState,
        applyMiddleware(thunkMiddleware, loggerMiddleware) // thunk가 먼저 나와야한다. 함수에 대한 로그를 찍고싶지는 않으니까.
    )
}
# Redux FAQ : General

- when should I learn Redux?
- when should I use Redux?
- Can Redux only be used with React?
- Do I need to have a particular build tool to use Redux?

## When should I learn Redux?

- If you have no problems with state management, Just use built-in state management systems of UI libraries.
  If application becomes so complex and confused about where state is stored or how state changes, then It's good time to learn Redux.

_Further info_

- Deciding What Not To Learn

  1. Organizing all the tech into categories that make sense in my mind.
  2. Simply pick the ones that I'm truly interested in right now. and cross out everything else.
  3. Things I already know but Don't plan on investing any more learning/attention -> cross out.
  4. Things I know well enough but that keep on giving the more you put into mastering them (like git) -> make the cut.
  5. X have to learn everything. X have to stay up to date on sth you learned.
  6. litmus test : "True Interest"

- How to learn web frameworks
  junior developer : take a step back. _It's unrealistic for you to expect yourself to learn a framework that solves a problem you've never experienced._
  Instead, Start by looking at the value proposition of the framework.
  The examples are especially instructive.
  (Try to build a web application with tech you already know -> struggle -> Look at new technology. It'll make more sence.)
  Frameworks exist to solve probs. not to impress people or make your life harder. : X look them as Probs, look them as tools for solving probs. X chore, O discovery.

- Redux vs MobX vs Flux Do you even need that?

  - How about none? : not every app needs one.<br>
    beginners certainly don't need one.<br>
    X chasing a hundred golden goose at once that will get you none.

  - Master your React skills. Do a learning project.<br>
    master lifecycle hooks. understand how react works.<br>
    common prob for people who try to have everything all at the same time: No clear mental map of what's in React, and what's in Redux.

  - get a bit unwiedly to manage? <br>
    all by yourself, start to see certain pattern, start feeling a certain pain -> you know sth could be better. : Redux.

## When should I use Redux?

- Don't use Redux until you have problems with vanilla React.
- Make informed decisions about your tools (Redux), and understand the tradeoffs(X fastest, shortest way to write code // single source of truth, able to manage application's states well ) involved in each decision.

## Can Redux only be used with React?

- Redux can be used as a data store for any UI layer
- common usaage : with react, with react native.
- Redux simply provides pub/sub mechanism

## Do I need to have a particular build tool to use Redux?

- Webpack, Babel (transplie ES6 for production into ES5)
- Redux also offers UMD build

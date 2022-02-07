# Orchestrate

Simple dependency injection system for loading a buch of hooks ( async support ) that may both populate and receive dependencies from a context object. An example use case is for a plugin system where plugins may depend on each other's services. `orchestrate` detects their dependecies and loads them in proper order.

### Install
```
npm i @desislavsd/orchestrate
```

### Usage
```typescript
import { orchestrare } from '@desislavsd/orchestrate'

let plugins = {

    /**
     * @param {Object} context the object that is being populated with all dependencies. For convinience it has reference to itself under `context` key
     * @param { Any } options the options provided to that specific hook ( plugin )
     **/
    async foo({ context, onContextReady }, {cfg}) {

        cfg // true

        // execution may be async
        await new Promise( resolve => setTimeout(resolve, 1000) )
        
        // add dependecy to context to be available for other services
        context.baz = 123

        // do something (sideeffect) after all hooks/plugins 
        // were successfully loaded
        onContextReady(() => {
            console.log('Context ready')
        })

        console.log('foo ready')
    },

    bar({
        baz, // 123
        
        // foo was not provided to the context by any hook but by default
        // each hook adds its name to the `context` as true when loaded
        // so that another hook may await its execution even though no service is provided
        foo, // true; 
    }) {

        console.log('bar ready')
    }
}

// second param is for options
orchestrate( plugins, { 

    // initial context
    context: {some: true}, 
    
    // options to pass as second param to `foo` plugin
    foo: {
        cfg: true
    }

    // ... options to other plugins
})

// Output:
// > foo ready
// > bar ready
// > Context ready
// @flow
import 'core-js/es6/reflect'  // required for babel-plugin-transform-builtin-extend in RN iOS and Android
import './globals.native'

import DumbSheet from './dev/dumb-sheet'
import DumbChatOnly from './dev/chat-only.native'
import Main from './main'
import React, {Component} from 'react'
import configureStore from './store/configure-store'
import {AppRegistry} from 'react-native'
import {Provider} from 'react-redux'
import {makeEngine} from './engine'
import {setup as setupLocalDebug, dumbSheetOnly, dumbChatOnly} from './local-debug'
import routeDefs from './routes'
import {setRouteDef} from './actions/route-tree'
import {setupSource} from './util/forward-logs'

module.hot && module.hot.accept(() => {
  console.log('accepted update in shared/index.native')
  if (global.store) {
    // We use global.devStore because module scope variables seem to be cleared
    // out after a hot reload. Wacky.
    console.log('updating route defs due to hot reload')
    global.store.dispatch(setRouteDef(require('./routes').default))
  }
})

class Keybase extends Component {
  store: any;

  constructor (props: any) {
    super(props)

    if (!global.keybaseLoaded) {
      global.keybaseLoaded = true
      setupSource()
      this.store = configureStore()
      global.store = this.store
      setupLocalDebug(this.store)
      this.store.dispatch(setRouteDef(routeDefs))
      makeEngine()
    } else {
      this.store = global.store
    }
  }

  render () {
    let child

    if (dumbSheetOnly) {
      child = <DumbSheet />
    } else if (dumbChatOnly) {
      child = <DumbChatOnly />
    } else {
      child = <Main />
    }

    return (
      <Provider store={this.store}>
        {child}
      </Provider>
    )
  }
}

function load () {
  AppRegistry.registerComponent('Keybase', () => Keybase)
}

export {
  load,
}

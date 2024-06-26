import 'react-native-gesture-handler'
import { StatusBar } from 'expo-status-bar'
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { Bible } from './src/components/bible/bible'
import { Menu } from './src/components/bible/menu'
import { NavigationContainer } from '@react-navigation/native'
import * as Font from 'expo-font'
import { useEffect, useState } from 'react'
import { MyProvider } from './src/contexts/items-provider'
import ToastManager, { Toast } from 'toastify-react-native'

const width = Dimensions.get('screen').width
const height = Dimensions.get('screen').height

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false)

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
        'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf')
      })
      setFontsLoaded(true)
    }

    loadFonts()
  }, [])

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />
  }

  return (
    <>
      <MyProvider>
        <StatusBar backgroundColor="#313131" />
        <NavigationContainer
          theme={{
            colors: {
              background: '#fff',
              border: '#313131',
              card: '#313131',
              notification: '#313131',
              primary: '#313131',
              text: '#fff'
            },
            dark: true
          }}
        >
          <Menu />
        </NavigationContainer>
      </MyProvider>
      <ToastManager
        width={width - 40}
        height={80}
        textStyle={{ fontSize: 14 }}
      />
    </>
  )
}

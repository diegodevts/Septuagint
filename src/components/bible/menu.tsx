import { createDrawerNavigator } from '@react-navigation/drawer'
import { DrawerActions, NavigationContainer } from '@react-navigation/native'
import { Bible } from './bible'
import { Dictionary } from '../dictionary/dictionary'
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { FontAwesome6, Entypo, MaterialIcons } from '@expo/vector-icons'
import { useContext, useMemo } from 'react'
import MyContext from '@/src/contexts/items-context'

const Drawer = createDrawerNavigator()

function CustomDrawerToggleButton({ navigation }: any) {
  return (
    <TouchableOpacity
      style={{ marginLeft: 10, paddingRight: 16 }}
      onPress={() => navigation.toggleDrawer()}
    >
      <MaterialIcons name="menu" size={30} color="#fff" />
    </TouchableOpacity>
  )
}

export const Menu = () => {
  const {
    bookPage,
    currentBookIndex,
    portugueseBooksNames,
    setCurrentBookName,
    currentBookName
  } = useContext(MyContext)

  useMemo(() => {
    setCurrentBookName(portugueseBooksNames[currentBookIndex])
  }, [currentBookIndex])

  return (
    <Drawer.Navigator
      useLegacyImplementation={false}
      initialRouteName="Bible"
      screenOptions={({ navigation }) => ({
        headerLeft: () => <CustomDrawerToggleButton navigation={navigation} />,
        drawerStyle: {
          backgroundColor: '#313131',
          paddingVertical: 20
        },
        drawerActiveBackgroundColor: '#fff',
        drawerInactiveTintColor: '#fff'
      })}
    >
      <Drawer.Screen
        name="Bible"
        component={Bible}
        options={{
          drawerLabel: ({ focused }) => (
            <Text style={{ color: focused ? '#313131' : '#fff' }}>Bible</Text>
          ),
          drawerIcon: ({ focused }) => (
            <FontAwesome6
              color={focused ? '#313131' : '#fff'}
              name="book-bible"
            />
          ),
          headerTitle: () => (
            <View
              style={{
                flexDirection: 'row',
                gap: 10
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontFamily: 'Poppins-Regular',
                  fontSize: 18
                }}
              >
                {currentBookName}
              </Text>

              <Text
                style={{
                  color: '#fff',
                  fontFamily: 'Poppins-Regular',
                  fontSize: 18
                }}
              >{`${bookPage}`}</Text>
            </View>
          )
        }}
      />
      <Drawer.Screen
        options={{
          drawerLabel: ({ focused }) => (
            <Text style={{ color: focused ? '#313131' : '#fff' }}>
              Dictionary
            </Text>
          ),
          drawerIcon: ({ focused }) => (
            <Entypo color={focused ? '#313131' : '#fff'} name="open-book" />
          )
        }}
        name="Dictionary"
        component={Dictionary}
      />
    </Drawer.Navigator>
  )
}

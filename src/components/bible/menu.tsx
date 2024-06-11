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
import { useContext, useMemo, useState } from 'react'
import MyContext from '@/src/contexts/items-context'
import { Picker } from '@react-native-picker/picker'
import { Toast } from 'toastify-react-native'

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
    setBookPage,
    setCurrentBookIndex,
    portugueseBooksNames,
    setCurrentBookName,
    currentBookName
  } = useContext(MyContext)

  const handleChapter = (value: string) => {
    setBookPage(+value)
  }

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
              <Picker
                style={styles.picker}
                selectedValue={currentBookName}
                onValueChange={(itemValue, itemIndex) =>
                  setCurrentBookIndex(itemIndex)
                }
                mode="dropdown"
              >
                {portugueseBooksNames.map((value, index) => (
                  <Picker.Item
                    style={styles.pickerItem}
                    key={index}
                    label={value}
                    value={value}
                    fontFamily="Poppins-Regular"
                  />
                ))}
              </Picker>
              <TextInput
                style={{
                  color: '#fff',
                  fontFamily: 'Poppins-Regular',
                  fontSize: 18
                }}
                onChangeText={(e) => handleChapter(e)}
                value={`${bookPage}`}
                keyboardType="numeric"
              />
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

const styles = StyleSheet.create({
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: '#fff'
  },
  picker: {
    height: 50,
    width: 160,
    color: '#fff',
    backgroundColor: '#313131',
    fontFamily: 'Poppins-Regular',
    fontSize: 18
  },
  pickerItem: {
    color: '#fff',
    backgroundColor: '#313131'
  }
})

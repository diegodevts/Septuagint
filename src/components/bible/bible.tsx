import {
  Dimensions,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PermissionsAndroid,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import MyContext from '@/src/contexts/items-context'
import Voice, {
  SpeechErrorEvent,
  SpeechResultsEvent
} from '@react-native-voice/voice'
import {
  normalizeBookName,
  capitalizeFirstLetter
} from '@/src/utils/capitalize'
import { Toast } from 'toastify-react-native'

const height = Dimensions.get('screen').height
const width = Dimensions.get('screen').width

export const Bible = () => {
  const {
    handleBookPage,
    greekChapter,
    portugueseChapter,
    setCurrentBookIndex,
    setBookPage,
    portugueseBooksNames
  } = useContext(MyContext)
  const [voiceMode, setVoiceMode] = useState(false)
  const [voiceResults, setVoiceResults] = useState<string[] | undefined>([])
  const greekRef = useRef<number[]>([])

  const scrollRef = useRef<ScrollView>(null)

  const formatedGreekChapter = greekChapter
    .replaceAll(/Chapter \d+/g, '')
    .trim()

  const formatedPortugueseChapter = portugueseChapter
    .replaceAll(/Capítulo \d+/g, '')
    .trim()

  const eachVerseOfGreekChapter = formatedGreekChapter
    .split(/\d+/)
    .map((string) => string.replace(/[\n\t]/g, ' '))
  const eachVerseOfPortugueseChapter = formatedPortugueseChapter
    .split(/\d+/)
    .map((string) => string.replace(/[\n\t]/g, ' '))

  const onSpeechError = (error: SpeechErrorEvent) => {
    console.log(error)
  }

  const startVoiceMode = async () => {
    await Voice.start('pt-BR')
    setVoiceMode(true)
  }
  const stopVoiceMode = async () => {
    await Voice.stop()
    setVoiceMode(false)
  }

  const requestMicrophonePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Ok')
      } else {
        console.log('Permission denied')
      }
    } catch (err) {
      console.warn('')
    }
  }

  useMemo(() => {
    requestMicrophonePermission()

    Voice.onSpeechResults = (result: SpeechResultsEvent) => {
      setVoiceResults(result.value)
    }

    Voice.onSpeechError = onSpeechError

    return () => Voice.destroy().then(Voice.removeAllListeners)
  }, [])

  const handleVerseLayout = (e: LayoutChangeEvent) => {
    greekRef.current.push(e.nativeEvent.layout.y)
  }

  useEffect(() => {
    ;(async () => {
      if (voiceResults && voiceResults.length > 0) {
        const formattedResults = voiceResults[0].split(' ')
        let book = capitalizeFirstLetter(
          formattedResults
            .slice(0, formattedResults.indexOf('verso') - 1)
            .toString()
            .split(',')
            .join(' ')
        )

        const chapter = formattedResults[formattedResults.indexOf('verso') - 1]
        const verse = formattedResults[formattedResults.length - 1]

        if (book.includes('Primeira')) {
          book = book.replace(/Primeira/i, '1')
        }

        if (book.includes('Segunda')) {
          book = book.replace(/Segunda/i, '2')
        }

        const currentBookIndex = normalizeBookName(portugueseBooksNames, book)

        if (currentBookIndex != -1 && !isNaN(+chapter)) {
          setCurrentBookIndex(currentBookIndex)
          setBookPage(+chapter)

          scrollRef.current?.scrollTo({
            y: greekRef.current[+verse - 1],
            animated: true
          })

          greekRef.current.length = 0
          return
        }

        Toast.error(`Não encontramos nenhum livro chamado ${book}`, 'top')
      }
    })()
  }, [voiceResults])

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={{ height: '100%' }} ref={scrollRef}>
        <View
          style={{
            padding: 5,
            height: '100%'
          }}
        >
          <View style={[styles.text]}>
            {eachVerseOfGreekChapter.map(
              (verse, index) =>
                verse != '' && (
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 5
                    }}
                    onLayout={handleVerseLayout}
                  >
                    <View style={styles.column}>
                      <Text key={`verse1_${index}`}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                          {index}
                        </Text>
                        {` ${verse}`}
                      </Text>
                    </View>

                    <View style={styles.column}>
                      <Text key={`verse2_${index}`}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                          {index}
                        </Text>
                        {` ${eachVerseOfPortugueseChapter[index]}`}
                      </Text>
                    </View>
                  </View>
                )
            )}
          </View>
        </View>
      </ScrollView>

      <Icon
        name="caret-left"
        size={40}
        color="#313131"
        style={styles.caretLeft}
        onPress={() => handleBookPage('left')}
      />

      <TouchableOpacity
        style={{
          height: 50,
          position: 'absolute',
          width: 50,
          borderRadius: 50,
          top: height - 200,
          left: width / 2.4,
          zIndex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: !voiceMode ? '#218B52' : 'red'
        }}
        onPress={!voiceMode ? startVoiceMode : stopVoiceMode}
      >
        <Icon
          name="microphone"
          size={20}
          color="white"
          style={{ color: '#fff', display: !voiceMode ? 'flex' : 'none' }}
        />

        <Icon
          name="stop"
          size={20}
          color="#fff"
          style={{ display: voiceMode ? 'flex' : 'none' }}
        />
      </TouchableOpacity>

      <Icon
        name="caret-right"
        size={40}
        color="#313131"
        style={styles.caretRight}
        onPress={() => handleBookPage('right')}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5
  },
  column: {
    flex: 1,
    width: '100%',
    flexDirection: 'row'
  },
  caretLeft: {
    position: 'absolute',
    top: height - 200,
    right: width - 50
  },
  caretRight: {
    position: 'absolute',
    top: height - 200,
    left: width - 50
  },
  container: {
    display: 'flex',
    width: '100%',
    height: '100%',
    padding: 3
  },
  text: {
    fontFamily: 'Poppins-Regular',
    fontWeight: 'semibold',
    textAlign: 'left',
    width: '100%',
    fontSize: 14
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  }
})

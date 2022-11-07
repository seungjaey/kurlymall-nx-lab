import {readFile, writeFile} from 'fs/promises'
import ProgressBar from 'progress';
import {
  pipe,
  map,
  toAsync,
  concurrent,
  size,
  nth,
  countBy,
  tap,
  fromEntries,
  concat
} from '@fxts/core'

import ALL_FILE_LIST from './ALL_FILE_LIST.json'

type ColorSet = 'kurlyPurple'
  | 'loversThePurple'
  | 'loversPurple'
  | 'loversLavender'
  | 'loversWhite'
  | 'loversFriends'
  | 'shadowGray'
  | 'numBg'
  | 'lightGray'
  | 'btnGray'
  | 'bg'
  | 'defaultTagBg'
  | 'bgLightGray'
  | 'tabBg'
  | 'kurlyWhite'
  | 'kurlyGray100'
  | 'kurlyGray150'
  | 'kurlyGray200'
  | 'kurlyGray250'
  | 'kurlyGray300'
  | 'kurlyGray350'
  | 'kurlyGray400'
  | 'kurlyGray450'
  | 'kurlyGray500'
  | 'kurlyGray600'
  | 'kurlyGray700'
  | 'kurlyGray800'
  | 'kurlyGray900'
  | 'kurlyBlack'
  | 'validBlue'
  | 'invalidRed'
  | 'toastFailBg'
  | 'loversTag'
  | 'pointText'
  | 'pointBorder'
  | 'point'
  | 'gradeToolTipBorder'
  | 'gradeToolTipBg'
  | 'gradeGraphBorder'
  | 'gradeGraphBg'
  | 'toolTip'
  | 'kakaoText'
  | 'kakaoBtn'
  | 'cold'
  | 'frozen'
  | 'room'
  | 'kakaoBg'
  | 'disabled'
  | 'borderColor'
  | 'placeholder'
  | 'kurlyPassRefund'
  | 'filterPurple'

const COLOR: Record<ColorSet, string> = {
  /** Primary Color */
  kurlyPurple: '#5f0080',
  /** Extended Brand Color */
  loversThePurple: '#4f177a',
  loversPurple: '#641898',
  loversLavender: '#8d4cc4',
  loversWhite: '#a864d8',
  loversFriends: '#cba3e9',
  /** Neutral Color */
  shadowGray: 'rgba(51, 51, 51, .2)',
  numBg: 'rgba(0, 0, 0, .15)',
  lightGray: '#ddd',
  btnGray: '#f2f2f2',
  bg: '#f4f4f4',
  defaultTagBg: 'rgba(102, 102, 102, .06)',
  bgLightGray: '#f7f7f7',
  tabBg: '#fcfcfc',
  /** Grayscale */
  kurlyWhite: '#fff',
  kurlyGray100: '#fafafa',
  kurlyGray150: '#f5f5f5',
  kurlyGray200: '#eee',
  kurlyGray250: '#e2e2e2',
  kurlyGray300: '#d9d9d9',
  kurlyGray350: '#ccc',
  kurlyGray400: '#b5b5b5',
  kurlyGray450: '#999',
  kurlyGray500: '#808080',
  kurlyGray600: '#666',
  kurlyGray700: '#4c4c4c',
  kurlyGray800: '#333',
  kurlyGray900: '#1a1a1a',
  kurlyBlack: '#000',
  /** Semantic Color */
  validBlue: '#257cd8',
  invalidRed: '#f03f40',
  toastFailBg: '#ffe3e2',
  /** Benefit Color */
  loversTag: '#ee6a7b',
  pointText: '#fa622f',
  pointBorder: '#e8a828',
  point: '#ffbf00',
  /** Grade Benefit Color */
  gradeToolTipBorder: '#efe9f3',
  gradeToolTipBg: '#fbf8fc',
  gradeGraphBorder: '#dcdbdd',
  gradeGraphBg: '#dcdbde',
  /** Tooltip Color */
  toolTip: '#bd76ff',
  /** Element Color */
  kakaoText: '#3c1e1e',
  kakaoBtn: '#ffde00',
  kakaoBg: '#f6e500',
  cold: '#5ec49e',
  frozen: '#6faff3',
  room: '#ff9b5c',
  /** Kakao */
  // 디자인 시스템에는 없으나 자주 쓰이는 컬러
  disabled: '#ccc',
  borderColor: '#ccc',
  placeholder: '#ccc',
  kurlyPassRefund: '#b3130b',
  /** Filter Color */
  filterPurple: '#faf3ff',
}

const progressBar = new ProgressBar('Processing [:bar] :percent :current/:total', {
  width: 30,
  total: size(ALL_FILE_LIST)
})

const run = async () => {
  const result = await pipe(
    ALL_FILE_LIST,
    toAsync,
    tap(() => progressBar.tick()),
    map(async path => {
      const buffer = await readFile(path)
      progressBar.tick()
      return [path, buffer.toString()]
    }),
    map(args => {
      const [path, fileContent] = args
      const hardCodedColorRegexIter = fileContent.matchAll(/(rgba\s*?\(\s*?(000|0?\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*?,\s*?(000|0?\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*?,\s*?(000|0?\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*?,\s*?(0|0?\.\d*|1|1.0*)\s*?\))|(rgb\s*?\(\s*?(000|0?\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*?,\s*?(000|0?\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*?,\s*?(000|0?\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\s*?\))|(transparent)|(#([a-fA-F0-9]){6})|(#([a-fA-F0-9]){3})|(hsl\s*?\(\s*?(000|0?\d{1,2}|[1-2]\d\d|3[0-5]\d|360)\s*?,\s*?(000|100|0?\d{2}|0?0?\d)%\s*?,\s*?(000|100|0?\d{2}|0?0?\d)%\s*?\))|(hsla\s*?\(\s*?(000|0?\d{1,2}|[1-2]\d\d|3[0-5]\d|360)\s*?,\s*?(000|100|0?\d{2}|0?0?\d)%\s*?,\s*?(000|100|0?\d{2}|0?0?\d)%\s*?,\s*?(0|0\.\d*|1|1.0*)\s*?\))/gm)
      const hardCodedColorList = pipe(
        hardCodedColorRegexIter,
        map(iter => ({ key: nth(0, iter) })),
      )
      const colorSetColorRegexIter = fileContent.matchAll(/COLOR\.(kurlyPurple|loversThePurple|loversPurple|loversLavender|loversWhite|loversFriends|shadowGray|numBg|lightGray|btnGray|bg|defaultTagBg|bgLightGray|tabBg|kurlyWhite|kurlyGray100|kurlyGray150|kurlyGray200|kurlyGray250|kurlyGray300|kurlyGray350|kurlyGray400|kurlyGray450|kurlyGray500|kurlyGray600|kurlyGray700|kurlyGray800|kurlyGray900|kurlyBlack|validBlue|invalidRed|toastFailBg|loversTag|pointText|pointBorder|point|gradeToolTipBorder|gradeToolTipBg|gradeGraphBorder|gradeGraphBg|toolTip|kakaoText|kakaoBtn|cold|frozen|room|kakaoBg|disabled|borderColor|placeholder|kurlyPassRefund|filterPurple)/gm)
      const colorSetColorList = pipe(
        colorSetColorRegexIter,
        map(iter => nth(1, iter)),
        map(colorVar => ({ key: COLOR[colorVar as unknown as ColorSet] }))
      )
      // @ts-ignore
      const colorFreqObject = countBy(color => color.key as string, concat(hardCodedColorList, colorSetColorList))
      return [path, colorFreqObject]
    }),
    concurrent(30),
    // @ts-ignore
    fromEntries,
  )

  await writeFile('SOURCE_BY_COLOR_DICTIONARY.json', JSON.stringify(result))
}

run()
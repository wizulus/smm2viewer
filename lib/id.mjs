import { Code, isNSOCourseCode, isNSOMakerCode, isOCWCourseCode, isOCWMakerCode } from '@wizulus/code'

export function stripCode (str) {
  if (!str) return ''
  return new Code(str.toUpperCase()).toString().split('-').join('')
}

export function formatCode (str) {
  if (!str) return ''
  return new Code(str.toUpperCase()).toString()
}

export function isCourseCode (str) {
  if (!str) return false
  return isOCWCourseCode(str.toUpperCase()) || isNSOCourseCode(str.toUpperCase())
}

export function isMakerCode (str) {
  if (!str) return false
  return isOCWMakerCode(str.toUpperCase()) || isNSOMakerCode(str)
}

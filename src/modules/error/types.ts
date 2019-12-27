export interface Err<Code extends string = string> {
  code: Code
  message?: string
}

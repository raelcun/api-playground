export interface Err<T extends string = string> {
  code: T
  message?: string
}

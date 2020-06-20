import { either as E } from 'fp-ts'

import { filterObjectKeys } from '@lib/utils'

import { calculateConfig } from './config'
import { ConfigMap } from './types'

type MockConfig = {
  a: { b: number; c: string; arr: { d: { e: string; f?: string } }[] }
  g: number
}

const defaultConfig: MockConfig = {
  a: { b: 5, c: 'c', arr: [{ d: { e: 'e', f: 'f' } }, { d: { e: 'e' } }] },
  g: 8,
}

describe('config', () => {
  test('overrides nested object keys', () => {
    const configMap: ConfigMap<MockConfig> = {
      default: () => E.right(defaultConfig),
      'default-test': () => E.right({ a: { c: 'newC' } }),
    }

    expect(calculateConfig(configMap, 'env', 'test')).toMatchSnapshot()
  })

  test('overrides whole array', () => {
    const configMap: ConfigMap<MockConfig> = {
      default: () => E.right(defaultConfig),
      'default-test': () => E.right({ a: { arr: [{ d: { e: 'foo' } }] } }),
    }

    expect(calculateConfig(configMap, 'env', 'test')).toMatchSnapshot()
  })

  test('missing partial config does not fail', () => {
    const configMap: ConfigMap<{ a: number }> = {
      default: () => E.right({ a: 1 }),
      stage: () => E.right({ a: 2 }),
    }

    expect(calculateConfig(configMap, '', '')).toMatchSnapshot()
  })

  test('failed default config fails merge', () => {
    const configMap: ConfigMap<{ a: number }> = {
      default: () => E.left({ code: 'VALIDATION_FAILED' }),
      'default-test': () => E.right({ a: 2 }),
    }

    expect(calculateConfig(configMap, 'default', 'test')).toMatchSnapshot()
  })

  test('failed partial config fails merge', () => {
    const configMap: ConfigMap<{ a: number }> = {
      default: () => E.right({ a: 2 }),
      'default-test': () => E.left({ code: 'VALIDATION_FAILED' }),
    }

    expect(calculateConfig(configMap, 'default', 'test')).toMatchSnapshot()
  })

  describe('config hierarchy', () => {
    const env = 'stage'
    const context = 'testing'
    const keyMap = {
      defaultContext: `default-${context}`,
      env,
      localEnv: `local-${env}`,
      envContext: `${env}-${context}`,
      localEnvContext: `local-${env}-${context}`,
    }
    const fullConfigMap: ConfigMap<{ foo: number }> = {
      default: () => E.right({ foo: 1 }),
      [keyMap.defaultContext]: () => E.right({ foo: 2 }),
      [keyMap.env]: () => E.right({ foo: 3 }),
      [keyMap.localEnv]: () => E.right({ foo: 4 }),
      [keyMap.envContext]: () => E.right({ foo: 5 }),
      [keyMap.localEnvContext]: () => E.right({ foo: 6 }),
    }

    test.each([
      ['defaultContext', [keyMap.defaultContext]],
      ['env', [keyMap.defaultContext, keyMap.env]],
      ['localEnv', [keyMap.defaultContext, keyMap.env, keyMap.localEnv]],
      ['envContext', [keyMap.defaultContext, keyMap.env, keyMap.localEnv, keyMap.envContext]],
      [
        'localEnvContext',
        [
          keyMap.defaultContext,
          keyMap.env,
          keyMap.localEnv,
          keyMap.envContext,
          keyMap.localEnvContext,
        ],
      ],
    ])('%s should take highest priority', (_, keys) => {
      expect(
        calculateConfig(
          {
            default: fullConfigMap.default,
            ...filterObjectKeys(fullConfigMap, keys),
          },
          env,
          context,
        ),
      ).toMatchSnapshot()
    })
  })
})

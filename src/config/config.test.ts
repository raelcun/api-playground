import { filterObjectKeys } from '@utils'

import { ConfigMap, mergeConfig } from './config'

type MockConfig = {
  a: {
    b: number
    c: string
    arr: {
      d: {
        e: string
        f?: string
      }
    }[]
  }
  g: number
}

const defaultConfig: MockConfig = {
  a: {
    b: 5,
    c: 'c',
    arr: [
      {
        d: {
          e: 'e',
          f: 'f',
        },
      },
      {
        d: {
          e: 'e',
        },
      },
    ],
  },
  g: 8,
}

describe('config', () => {
  test('overrides nested object keys', () => {
    const configMap: ConfigMap<MockConfig> = {
      default: defaultConfig,
      'default-test': {
        a: {
          c: 'newC',
        },
      },
    }

    expect(mergeConfig(configMap, 'env', 'test')).toMatchSnapshot()
  })

  test('overrides whole array', () => {
    const configMap: ConfigMap<MockConfig> = {
      default: defaultConfig,
      'default-test': {
        a: {
          arr: [
            {
              d: {
                e: 'foo',
              },
            },
          ],
        },
      },
    }

    expect(mergeConfig(configMap, 'env', 'test')).toMatchSnapshot()
  })

  test('missing partial config does not fail', () => {
    const configMap: ConfigMap<{ a: number }> = {
      default: { a: 1 },
      stage: { a: 2 },
    }

    expect(mergeConfig(configMap, '', '')).toMatchSnapshot()
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
      default: { foo: 1 },
      [keyMap.defaultContext]: { foo: 2 },
      [keyMap.env]: { foo: 3 },
      [keyMap.localEnv]: { foo: 4 },
      [keyMap.envContext]: { foo: 5 },
      [keyMap.localEnvContext]: { foo: 6 },
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
        mergeConfig(
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

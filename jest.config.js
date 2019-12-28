const { pathsToModuleNameMapper } = require('ts-jest/utils')
const { compilerOptions } = require('./tsconfig')

module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  modulePaths: ['<rootDir>/src'],
  testEnvironment: 'node',
  testRegex: '\\.(test|integration)\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  coveragePathIgnorePatterns: ['/node_modules/', '/index.ts', '/configuration/'],
  moduleDirectories: ['node_modules', '.'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
}

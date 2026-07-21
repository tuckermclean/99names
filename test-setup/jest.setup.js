/**
 * Global Jest setup for jest-expo.
 * Mocks native-only modules that have no browser/Node shim so pure-logic
 * and provider-level tests can run under the standard jest-expo preset
 * without a real device/simulator.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

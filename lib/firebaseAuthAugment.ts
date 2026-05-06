/**
 * firebase/auth typings default to browser exports; RN builds include getReactNativePersistence
 * at runtime (Metro resolves @firebase/auth → react-native field).
 */
import type { Persistence } from 'firebase/auth';
import type { AsyncStorageStatic } from '@react-native-async-storage/async-storage';

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: AsyncStorageStatic): Persistence;
}

export {};

import { USE_MOCK_DATA } from '../config/env';

export function withMock<T>(value: T, fallback: T): T {
  return USE_MOCK_DATA ? value : fallback;
}

import * as bcrypt from 'bcrypt';
import { OrderType } from 'src/types/order';

export const hashData = (input: string): Promise<string> =>
  bcrypt.hash(input, 10);

export const getRandomString = (): string =>
  Math.random().toString(36).substring(2, 7);

/**
 * Normalize order query
 * { type: 'asc', createdAt: 'asc' } => [{ type: 'asc' }, { createdAt: 'asc' }]
 */

export const normalizeOrderQuery = (
  orderQuery: Record<string, OrderType>,
): Record<string, OrderType>[] =>
  Object.keys(orderQuery).reduce((acc, key) => {
    acc.push({ [key]: orderQuery[key] });
    return acc;
  }, []);

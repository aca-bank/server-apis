import { ValidationError } from 'class-validator';
import { ExceptionMessage, ExceptionMessageDetails } from 'src/types/exception';

const normalizeConstraints = (constraints: { [type: string]: string }) =>
  Object.keys(constraints).reduce((acc, key) => {
    acc.code = key;
    acc.description = constraints[key];
    return acc;
  }, {} as ExceptionMessageDetails);

export const normalizeValidationErrors = (
  errors: ValidationError[],
): ExceptionMessage[] => {
  return errors.map((error) => ({
    fieldName: error.property,
    payload: error.target,
    details: normalizeConstraints(error.constraints),
  }));
};

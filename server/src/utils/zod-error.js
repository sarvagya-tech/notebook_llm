import { flattenError } from "zod";

/**
 * Flattens a Zod Error into a clean key-value object of field errors.
 * @param {import('zod').ZodError} error 
 */
export function getZodFieldErrors(error) {
    return flattenError(error).fieldErrors;
}

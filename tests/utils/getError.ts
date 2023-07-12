/**
 * @internal NOTE: don't export this class, it shouldn't be necessary
 */
class NoErrorThrownError extends Error {}

/**
 * Returns the error thrown by the given function, or throws an error if no error was thrown.
 * https://github.com/jest-community/eslint-plugin-jest/blob/v26.8.7/docs/rules/no-conditional-expect.md#how-to-catch-a-thrown-error-for-testing-without-violating-this-rule
 */
export const getError = async (runner: () => unknown) => {
  try {
    await runner();
    throw new NoErrorThrownError();
  } catch (e) {
    return e;
  }
};

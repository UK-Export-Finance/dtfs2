const sanitise = (string) =>
/**
     * Sanitises the input string by replacing occurrences of the sequence '\\n' with a newline character ('\n').
     *
     * @param string - The input string to be sanitised.
     * @returns The sanitised version of the input string, or undefined if no input string is provided.
     *
     * @example
     * const input = 'ABC\\nCBA';
     * const output = sanitise(input);
     * console.log(output);
     * // Output:
     * // ABC
     * // CBA
     */
  (string ? string.replace(/\\n|\\\n|\\\\n/g, '\n') : string);

module.exports = sanitise;

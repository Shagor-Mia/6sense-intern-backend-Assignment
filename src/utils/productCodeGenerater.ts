import crypto from "crypto";

export const generateProductCode = (name: string): string => {
  // Generate hash prefix (first 7 characters)
  const hash = crypto
    .createHash("md5")
    .update(name.toLowerCase())
    .digest("hex")
    .slice(0, 7);

  // Find all strictly increasing substrings and their positions
  const findIncreasingSubstrings = (
    str: string
  ): { substring: string; start: number; end: number }[] => {
    const result: { substring: string; start: number; end: number }[] = [];
    let current = "";
    let start = 0;

    for (let i = 0; i < str.length; i++) {
      // If first character or current character is greater than previous
      if (i === 0 || str[i].charCodeAt(0) > str[i - 1].charCodeAt(0)) {
        current += str[i];
      } else {
        // If current sequence ends and is a valid increasing substring (length > 1)
        if (current.length > 1) {
          result.push({ substring: current, start, end: i - 1 });
        }
        // Start a new sequence
        current = str[i];
        start = i;
      }
    }
    // Add the last sequence if it's a valid increasing substring
    if (current.length > 1) {
      result.push({ substring: current, start, end: str.length - 1 });
    }

    return result;
  };

  const cleanedName = name.toLowerCase().replace(/[^a-z]/g, ""); // Only consider letters
  const substrings = findIncreasingSubstrings(cleanedName);

  if (!substrings.length) {
    // Fallback if no increasing substrings of length > 1 are found
    // Uses the first character if available, otherwise 'x'
    const fallbackChar = cleanedName.length > 0 ? cleanedName[0] : "x";
    return `${hash}-0${fallbackChar}0`;
  }

  // Find the maximum length among the found substrings
  const maxLength = Math.max(...substrings.map((s) => s.substring.length));

  // Filter for all substrings that have the maximum length
  const longestSubstrings = substrings.filter(
    (s) => s.substring.length === maxLength
  );

  // Concatenate all longest substrings
  const combinedSubstring = longestSubstrings.map((s) => s.substring).join("");

  // Get the starting index of the very first longest substring found
  const firstOverallStart = longestSubstrings[0].start;

  // Get the ending index of the very last longest substring found
  const lastOverallEnd = longestSubstrings[longestSubstrings.length - 1].end;

  return `${hash}-${firstOverallStart}${combinedSubstring}${lastOverallEnd}`;
};

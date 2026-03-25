export const extractMentions = (text: string): string[] => {
  const mentionRegex = /@([\w\d.-]+@[\w\d.-]+\.[\w\d.-]+|[\w\d.-]+)/g;
  const matches = text.match(mentionRegex);
  if (!matches) return [];
  return matches.map((match) => match.substring(1));
};

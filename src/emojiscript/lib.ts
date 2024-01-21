export const segmentEmojiString = (string: string) =>
  [...new Intl.Segmenter().segment(string)].map((x) => x.segment)

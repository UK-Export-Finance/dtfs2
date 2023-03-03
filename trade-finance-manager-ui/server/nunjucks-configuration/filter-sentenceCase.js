const sentenceCase = (text) => {
  // Void `text` check
  if (!text || typeof text !== 'string') {
    return text;
  }

  return text.replace(
    /\w\S*/g,
    (t) => t.charAt(0).toUpperCase() + t.substring(1).toLowerCase(),
  );
};

module.exports = sentenceCase;

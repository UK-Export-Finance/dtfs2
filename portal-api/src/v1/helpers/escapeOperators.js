const escapeOperators = (filter) => {
  if (filter) {
    // Escape `AND` operator
    if ('AND' in filter) {
      const payload = {
        $and: filter.AND,
      };

      // Escape `OR` operator
      const or = payload.$and.map((e) => {
        if (e.OR) {
          const orPayload = {
            $or: e.OR,
          };

          delete e.OR;

          return orPayload;
        }

        return e;
      });

      payload.$and = or;

      delete payload.AND;

      return payload;
    }
  }
  return filter;
};

module.exports = {
  escapeOperators,
};

const formatDate = (date) => {
  const [day, month, year] = [
    String(date.getDate()).padStart(2, 0),
    String(date.getMonth() + 1).padStart(2, 0),
    String(date.getFullYear()),
  ];

  return `${day}/${month}/${year}`;
};

module.exports = { formatDate };

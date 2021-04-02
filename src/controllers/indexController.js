module.exports = (config) => {
  const IndexController = {
    // eslint-disable-next-line no-unused-vars
    async index(request, response, next) {
      const responseBody = { ...config };
      return response.json(responseBody);
    },

  };

  return IndexController;
};

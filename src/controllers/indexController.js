module.exports = (config) => {
    const IndexController = {
        async index(request, response) {
            const responseBody = { ...config };
            return response.json(responseBody);
        },

    };

    return IndexController;
};

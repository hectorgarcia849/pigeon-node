var generateMessage = (from, to, text) => {
    return {
        from,
        to,
        text,
        createdAt: new Date().getTime()
    }
};

module.exports = {generateMessage};
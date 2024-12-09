

const parseNumber = (number, defVal) => {
    const isStr = number === 'string';
    if (!isStr) return defVal;

    const parsedNum = parseInt(number);
    if (Number.isNaN(parsedNum)) {
        return defVal;
    }

    return parsedNum;
};

export const parsePaginationParams = (query) => {
    const { page, perPage } = query;

    const parsedPage = parseNumber(page);
    const parsedPerPage = parseNumber(perPage);

    return {
        page: parsedPage,
        perPage: parsedPerPage,
    };
};

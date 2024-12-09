
const parseContactType = (contactType) => {
    const isString = typeof contactType === 'string';
    if (!isString) return;
    const isContact = (contactType) => ['work', 'home', 'personal'].includes(contactType);

    if (isContact(contactType)) return contactType;
};


// const parseNumber = (number) => {
//     const isString = typeof number === 'string';
//     if (!isString) return;

//     const parsedNumb = parseInt(number);
//     if (parsedNumb.isNaN(parsedNumb)) return;

//     return parsedNumb;
// };


export const parseFilterParams = (query) => {
    const { contactType } = query;

    const parsedContactType = parseContactType(contactType);

    return {
        contactType: parsedContactType
    };
};

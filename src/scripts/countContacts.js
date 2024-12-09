import { readContacts } from "../utils/readContacts.js";

export const countContacts = async () => {
    const existingContacts = await readContacts();

    return existingContacts.length;

};


console.log(await countContacts());

import { readContacts } from "../utils/readContacts.js";

export const getAllContacts = async () => {
    const existingContacts = await readContacts();

    return existingContacts;

};


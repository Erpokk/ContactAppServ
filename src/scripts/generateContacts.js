
import { readContacts } from "../utils/readContacts.js";
import { createFakeContact } from "../utils/createFakeContact.js";
import { writeContacts } from "../utils/writeContacts.js";

export const generateContacts = async (number) => {
    try {
        const numContacts = parseInt(process.argv[2], 10) || number;
        const existingContacts = await readContacts();
        const newContacts = [];
        for (let i = 0; i < numContacts ; i++) {
            newContacts.push(createFakeContact());
        }

        const updatedContacts = [...existingContacts, ...newContacts];
        await writeContacts(updatedContacts);
    } catch (err) {
        console.log(err.message);
    }
};


generateContacts();

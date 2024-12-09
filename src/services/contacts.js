import { SORT_ORDER } from "../constants/index.js";
import { ContactsCollection } from "../db/models/contact.js";
import { calculatePaginationData } from "../utils/calculatePaginationData.js";


export const getAllContacts = async ({page = 1, perPage = 10, sortOrder = SORT_ORDER.ASC, sortBy='_id', filter={}, userID }) => {
    const limit = perPage;
    const skip = (page - 1) * perPage;

    const contactsQuery = ContactsCollection.find({userId : userID});

    if (filter.contactType) {
        contactsQuery.where('contactType').equals(filter.contactType);
    };

    const [contactsCount, contacts] = await Promise.all([
        ContactsCollection.find({ userId: userID }).merge(contactsQuery).countDocuments(),
        contactsQuery.skip(skip).limit(limit).sort({ [sortBy]: sortOrder}).exec(),
    ]);


    const paginationData = calculatePaginationData(contactsCount, perPage, page);

    return {
        data: contacts,
        ...paginationData,
    };
};


export const getContactById = async (contactID, userId) => {
    const contact = await ContactsCollection.findOne({_id: contactID, userId: userId});
    return contact;
};

export const createContact = async (payload, userId) => {
    const data = {
        ...payload,
        userId: userId,
    };
    const contact = await ContactsCollection.create(data);
    return contact;
};

export const deleteContact = async (contactID, userId) => {
    const contact = await ContactsCollection.findByIdAndDelete({_id: contactID, userId: userId});
    return contact;
};

export const updateContact = async (contactId, payload, userId, options = {}) => {
    const rawRes = await ContactsCollection.findOneAndUpdate(
        { _id: contactId, userId: userId },
        payload,
        {
            new: true,
            includeResultMetadata: true,
            ...options,
        },
    );
   

    if (!rawRes || !rawRes.value) {
        return null;
    }

    return {
        contact: rawRes.value,
        isNew: Boolean(rawRes?.lastErrorObject?.upserted),
    };
};

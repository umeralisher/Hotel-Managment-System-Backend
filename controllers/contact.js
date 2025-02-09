const Contact = require("../models/Contact");

// Create a new contact
exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const contact = new Contact({ name, email, phone, message });
    await contact.save();
    res.status(201).json({ message: "Message sent successfully!", contact });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all contacts
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch contacts", error: error.message });
  }
};

// Delete a contact by ID
exports.deleteContact = async (req, res) => {
  try {
    const contactId = req.params.id;

    const deletedContact = await Contact.findByIdAndDelete(contactId);

    if (!deletedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res
      .status(200)
      .json({ message: "Contact deleted successfully", deletedContact });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete contact", error: error.message });
  }
};

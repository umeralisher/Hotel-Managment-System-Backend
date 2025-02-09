const express = require("express");
const router = express.Router();
const {
  createContact,
  getContacts,
  deleteContact,
} = require("../controllers/contact");

router.post("/create-contact", createContact);

router.get("/get-contacts", getContacts);

router.delete("/del-contact/:id", deleteContact);

module.exports = router;

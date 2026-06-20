const mongoose = require("mongoose");

/*
  CONTENT MODEL
  -------------
  A single document holds all editable site content: founders, co-founders,
  team members, achievements, and contact/social info. Admins edit this
  through the admin panel; the public page reads it read-only.

  We use one fixed document (singleton pattern, _id: "site-content") rather
  than many small documents, since the whole site reads it together on load.
*/

const personSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    title: { type: String, default: "" }, // e.g. "Founder & CEO"
    bio: { type: String, default: "" },
    photoUrl: { type: String, default: "" } // empty = show placeholder silhouette
  },
  { _id: false }
);

const achievementSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },     // e.g. "Regional Valorant Champions"
    event: { type: String, default: "" },     // e.g. "VCT Challengers South Asia"
    year: { type: String, default: "" },
    description: { type: String, default: "" },
    photoUrl: { type: String, default: "" }
  },
  { _id: false }
);

const contentSchema = new mongoose.Schema({
  _id: { type: String, default: "site-content" },

  hero: {
    tagline: { type: String, default: "Multi-front roster // 4 active squads" },
    headline: { type: String, default: "Fly the Eyries colors" },
    subtext: { type: String, default: "Live scores, squads, and gear across BGMI, Valorant, PES & Free Fire." }
  },

  founder: { type: personSchema, default: () => ({}) },
  coFounders: { type: [personSchema], default: [] },
  team: { type: [personSchema], default: [] },
  achievements: { type: [achievementSchema], default: [] },

  contact: {
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    instagram: { type: String, default: "" },
    twitter: { type: String, default: "" },
    youtube: { type: String, default: "" },
    discord: { type: String, default: "" }
  }
});

module.exports = mongoose.model("Content", contentSchema);

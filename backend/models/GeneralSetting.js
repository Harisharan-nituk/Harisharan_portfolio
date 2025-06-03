// backend/models/GeneralSetting.js
import mongoose from 'mongoose';

const generalSettingsSchema = new mongoose.Schema(
  {
    siteIdentifier: {
      type: String,
      default: 'main_settings_doc',
      unique: true,
      required: true,
      index: true,
    },
    profilePhotoUrl: {
      type: String,
      default: '/images/default-profile.png', // Default if no photo uploaded
    },
    storedProfilePhotoFilename: { 
      type: String, 
    },
    ownerName: {
      type: String,
      default: 'Your Name',
      required: true,
    },
    jobTitle: {
      type: String,
      default: 'Your Profession / Title',
      required: true,
    },
    specialization: {
      type: String,
      default: 'Your Specialization / Tagline',
    },
    homePageIntroParagraph: {
      type: String,
      default: 'Welcome to my portfolio! Update this introduction from the admin panel.',
    },
  },
  {
    timestamps: true,
  }
);

generalSettingsSchema.statics.getSingleton = async function () {
  const identifier = 'main_settings_doc';
  let settings = await this.findOne({ siteIdentifier: identifier });
  if (!settings) {
    console.log('No general settings document found, creating one with default values...');
    settings = await this.create({ siteIdentifier: identifier }); 
    console.log('Default general settings document created.');
  }
  return settings;
};

const GeneralSetting = mongoose.model('GeneralSetting', generalSettingsSchema);
export default GeneralSetting;
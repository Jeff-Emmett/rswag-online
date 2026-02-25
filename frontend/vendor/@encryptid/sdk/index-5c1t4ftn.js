// src/types/index.ts
var AuthLevel;
((AuthLevel2) => {
  AuthLevel2[AuthLevel2["BASIC"] = 1] = "BASIC";
  AuthLevel2[AuthLevel2["STANDARD"] = 2] = "STANDARD";
  AuthLevel2[AuthLevel2["ELEVATED"] = 3] = "ELEVATED";
  AuthLevel2[AuthLevel2["CRITICAL"] = 4] = "CRITICAL";
})(AuthLevel ||= {});
var GuardianType;
((GuardianType2) => {
  GuardianType2["SECONDARY_PASSKEY"] = "secondary_passkey";
  GuardianType2["TRUSTED_CONTACT"] = "trusted_contact";
  GuardianType2["HARDWARE_KEY"] = "hardware_key";
  GuardianType2["INSTITUTIONAL"] = "institutional";
  GuardianType2["TIME_DELAYED_SELF"] = "time_delayed_self";
})(GuardianType ||= {});
var SpaceVisibility;
((SpaceVisibility2) => {
  SpaceVisibility2["PUBLIC"] = "public";
  SpaceVisibility2["PUBLIC_READ"] = "public_read";
  SpaceVisibility2["AUTHENTICATED"] = "authenticated";
  SpaceVisibility2["MEMBERS_ONLY"] = "members_only";
})(SpaceVisibility ||= {});

export { AuthLevel, GuardianType, SpaceVisibility };

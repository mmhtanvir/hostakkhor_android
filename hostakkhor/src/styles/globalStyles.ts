// No changes to import
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const colors = {
  primary: '#B35F24',          // Logo brown/orange
  secondary: '#4267B2',        // Facebook blue
  signInBlue: '#4169E1',       // Royal blue for sign in button
  background: '#F7F9FD',       // Light background for auth screens
  white: '#FFFFFF',
  black: '#222222',
  darkGray: '#333333',
  gray: '#666666',
  lightGray: '#EEEEEE',
  extraLightGray: '#F8F9FA',
  inputBorder: '#E8E8E8',
  divider: '#DDDDDD',
  placeholderText: '#999999',
};

export const fonts = {
  regular: 'Roboto',
  medium: 'Roboto-Medium',
  bold: 'Roboto-Bold',
  semiBold: 'Roboto-SemiBold',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: colors.background,
    minHeight: height,
  },

  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    zIndex: 10,
    elevation: 1,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#ddd',
  },
  
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 18,
  },
  signInButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  signInButtonText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 14,
    fontWeight: '500',
    includeFontPadding: false,
  },

  footer: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.extraLightGray,
  },
  footerText: {
    color: colors.gray,
    fontSize: 12,
    fontFamily: fonts.regular,
    includeFontPadding: false,
  },

  centeredSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  centeredScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    marginBottom: 12,
  },
  
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#444',
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  
  secondaryButton: {
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  
  secondaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },

  signInLargeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 4,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 2,
  },

  archiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20, // Fully rounded
    alignSelf: 'center', // Center it horizontally
    marginTop: 16,
  },
  archiveHeaderText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    textAlign: 'center',
    fontWeight: '500',
    color: colors.darkGray,
    marginLeft: 6,
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
  homeTitle: {
    fontSize: 24,
    fontFamily: fonts.bold,
    textAlign: 'center',
    fontWeight: '700',
    color: colors.black,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 30,
    includeFontPadding: false,
  },
  homeDescription: {
    fontSize: 14,
    fontFamily: fonts.regular,
    textAlign: 'center',
    color: colors.gray,
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
    includeFontPadding: false,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 4,
    marginHorizontal: 16,
    elevation: 2,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 8,
    includeFontPadding: false,
  },
  archiveTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    fontWeight: '700',
    color: colors.black,
    paddingHorizontal: 16,
    marginTop: 32,
    marginBottom: 8,
    includeFontPadding: false,
    textAlign: 'center',
  },
  archiveSubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.gray,
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
    includeFontPadding: false,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.extraLightGray,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    height: 40,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    color: colors.darkGray,
    fontFamily: fonts.regular,
    fontSize: 14,
    includeFontPadding: false,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  filterButtonText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontWeight: '500',
    fontSize: 12,
    includeFontPadding: false,
  },
  noPostsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  noPostsText: {
    color: colors.placeholderText,
    fontFamily: fonts.regular,
    fontSize: 14,
    includeFontPadding: false,
  },

  authContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  appName: {
    fontSize: 16,
    fontFamily: fonts.medium,
    fontWeight: '500',
    color: colors.darkGray,
    marginTop: 8,
    textAlign: 'center',
    includeFontPadding: false,
  },
  authTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    fontWeight: '700',
    color: colors.black,
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
    includeFontPadding: false,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 10,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    width: '100%',
    height: 44,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 4,
    paddingHorizontal: 12,
    fontFamily: fonts.regular,
    color: colors.darkGray,
    fontSize: 14,
    includeFontPadding: false,
  },
  primaryButton: {
    backgroundColor: colors.signInBlue,
    width: '100%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    marginTop: 8,
    elevation: 2,
  },
  primaryButtonText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontWeight: '500',
    fontSize: 14,
    includeFontPadding: false,
  },
  toggleContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.gray,
    includeFontPadding: false,
  },
  toggleLink: {
    color: colors.signInBlue,
    fontFamily: fonts.medium,
    fontWeight: '500',
    includeFontPadding: false,
  },
  socialContainer: {
    width: '100%',
    marginBottom: 20,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 4,
    marginBottom: 12,
    paddingHorizontal: 16,
    elevation: 1,
  },
  facebookButton: {
    backgroundColor: colors.secondary,
  },
  facebookButtonText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 10,
    includeFontPadding: false,
  },
  googleButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  googleButtonText: {
    color: colors.darkGray,
    fontFamily: fonts.medium,
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 10,
    includeFontPadding: false,
  },
  socialIcon: {
    width: 18,
    height: 18,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    fontWeight: '500',
    color: colors.gray,
    paddingHorizontal: 12,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },

  statusBar: {
    backgroundColor: colors.white,
  },
  
  inputWithIcon: {
    flex: 1,
    height: 40,
    paddingLeft: 10,
    color: '#333',
  },
  
  inputIcon: {
    marginRight: 6,
  },

  socialIconLeft: {
    marginRight: 8,
  },  
  
  // Post cards
  postCard: {
    width: '90%',
    height: 240, // Reduced height to match the image
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
    alignSelf: 'center',
    elevation: 3, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  postImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  postInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(205, 133, 63, 0.8)', // Brown with some transparency
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  postAuthor: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: fonts.bold,
    marginBottom: 4,
  },
  postLocation: {
    color: '#f0f0f0',
    fontSize: 14,
    fontStyle: 'italic',
    fontFamily: fonts.regular,
  },
  postAudioStatus: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fonts.regular,
    marginTop: 6,
  },
  postProfileContainer: {
    position: 'absolute',
    right: 20,
    bottom: 60, // Position above the info box
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  postProfileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  dropdown: {
    position: 'absolute',
    top: 45,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    paddingVertical: 8,
    paddingHorizontal: 16, // ⬅️ slightly more padding
    zIndex: 999,
    padding: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    paddingVertical: 8,
    fontSize: 16,
    color: '#333',
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  profileHeaderWrapper: {
    backgroundColor: colors.white,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.extraLightGray,
    paddingHorizontal: 16,
  },
  homeText: {
    fontSize: 18,
    fontFamily: fonts.medium,
    fontWeight: '500',
    color: colors.gray,
    marginTop: 4,
    includeFontPadding: false,
  },
  profileName: {
    fontSize: 20,
    fontFamily: fonts.bold,
    fontWeight: '700',
    color: colors.black,
    textAlign: 'left',
    marginBottom: 4,
    includeFontPadding: false,
  },
  profileHandle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.gray,
    marginBottom: 12,
    includeFontPadding: false,
  },
  tabButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.extraLightGray,
    backgroundColor: '#fff',
    marginBottom: 10,
    position: 'relative',
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  tabButtonText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.gray,
    includeFontPadding: false,
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  pinnedSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  pinnedTitle: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.black,
    marginBottom: 6,
    includeFontPadding: false,
  },
  pinnedCard: {
    backgroundColor: colors.white,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderRadius: 12,    
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C69759',
  },
  pinnedText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.darkGray,
    includeFontPadding: false,
  },

  // Header
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: -90,
    color: '#000',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: '#EFEFEF',
    borderRadius: 8,
  },
  logoutText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#000',
  },

  // Profile Card
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  profileImageLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 10,
  },
  
  profileEmail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  profileDate: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 2,
  },
  editProfileButton: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  editProfileText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
  },

  // Tab Switcher
  tabSwitcher: {
    flexDirection: 'row',
    marginTop: 16,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    padding: 4,
    justifyContent: 'space-between',
  },

  // Pinned Section
  pinnedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  themeButton: {
    flexDirection: 'row',
    backgroundColor: '#A65B0D',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  themeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  pinnedProfileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#A65B0D',
    marginBottom: 10,
  },
  pinnedName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#A65B0D',
  },
  pinnedBio: {
    fontSize: 12,
    color: '#555',
    marginBottom: 14,
  },
  pinEmptyBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  pinEmptyText: {
    fontSize: 13,
    color: '#888',
    marginTop: 6,
  },
  createPinButton: {
    marginTop: 10,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#EFEFEF',
    borderRadius: 6,
    alignItems: 'center',
  },
  createPinText: {
    fontSize: 12,
    color: '#000',
  },

  postContent: {
    fontSize: 14,
    lineHeight: 20,
  },

  // User Posts Section
  userPostsSection: {
    marginTop: 24,
    marginBottom: 60,
  },
  pinnedCardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 20,
    minHeight: 420,
  },
  
  pinnedCardImage: {
    resizeMode: 'cover',
  },
  
  pinnedTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#FBE9D0',
  },
  
  pinnedLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  pinnedLabel: {
    fontSize: 14,
    color: '#B35F24',
    fontWeight: '600',
  },
  
  pinnedDate: {
    fontSize: 13,
    color: '#7A6B5C',
  },
  
  pinnedProfileImageContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  
  pinnedProfileImageLarge: {
    width: 120,
    height: 120,
    borderRadius: 90,
    borderWidth: 4,
    borderColor: '#B35F24',
  },
  
  pinnedUserInfo: {
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#FBE9D0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 24,
  },
  
  pinnedUserName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B4F17',
    marginBottom: 4,
    textAlign: 'center',
  },
  
  pinnedUserBio: {
    fontSize: 14,
    color: '#7A6B5C',
    textAlign: 'center',
  },
  
  pinEmptyOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    marginLeft: 16,
  },    
  mydesign:{
    flexDirection : 'row',
    justifyContent: 'space-between'
  },
  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.3)',
  justifyContent: 'center',
  alignItems: 'center',
},
themeModalContainer: {
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 16,
  width: '90%',
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 5,
},
themeModalHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#B35F24',
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 20,
  alignSelf: 'flex-start',
  marginBottom: 16,
},
themeModalHeaderText: {
  color: '#fff',
  fontWeight: 'bold',
  marginLeft: 6,
},
themeModalTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 12,
  color: '#333',
},
themeCardRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},
themeCard: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 12,
  padding: 12,
  width: '48%',
  alignItems: 'center',
  position: 'relative',
},
selectedThemeCard: {
  borderColor: '#B35F24',
},
pinnedThemeLabel: {
  color: '#444',
  fontSize: 12,
  fontWeight: 'bold',
  marginBottom: 8,
},
pinnedThemeLabelGolden: {
  color: '#B35F24',
  fontSize: 12,
  fontWeight: 'bold',
  marginBottom: 8,
},
pinnedThemePreview: {
  backgroundColor: '#f4f4f4',
  height: 40,
  width: '100%',
  borderRadius: 6,
  marginBottom: 8,
},
pinnedThemePreviewGolden: {
  backgroundColor: '#FFF6E1',
  height: 40,
  width: '100%',
  borderRadius: 6,
  marginBottom: 8,
},
themeLabel: {
  fontSize: 12,
  fontWeight: '600',
  color: '#444',
},
themeCheckIcon: {
  position: 'absolute',
  top: 8,
  right: 8,
},
modalBackdrop: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},

themeModal: {
  width: '100%',
  backgroundColor: '#fff',
  borderRadius: 20,
  padding: 20,
  elevation: 10,
},

modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 16,
  color: '#000',
  textAlign: 'center',
},

themeOptionsRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},

themeCardImage: {
  width: 100,
  height: 100,
  marginVertical: 10,
  borderRadius: 8,
},

themeCardLabel: {
  fontSize: 14,
  fontWeight: '600',
  color: '#333',
},
avatarLarge: {
  width: 100,
  height: 100,
  borderRadius: 50,
},

cameraIconContainer: {
  position: 'absolute',
  bottom: 0,
  right: 0,
  backgroundColor: '#fff',
  padding: 6,
  borderRadius: 50,
  elevation: 2,
},

cameraIcon: {
  width: 20,
  height: 20,
},

linkText: {
  fontSize: 16,
  color: '#000',
},

textArea: {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  padding: 10,
  minHeight: 100,
  fontSize: 16,
  marginTop: 6,
  backgroundColor: '#fff',
},

caption: {
  fontSize: 13,
  color: '#777',
  marginTop: 4,
},

buttonPrimary: {
  backgroundColor: '#9d5c14',
  padding: 14,
  borderRadius: 10,
  alignItems: 'center',
},

editbuttonText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 16,
},

buttonOutlined: {
  borderWidth: 1,
  borderColor: '#ccc',
  padding: 14,
  borderRadius: 10,
  alignItems: 'center',
},

buttonTextOutlined: {
  color: '#000',
  fontWeight: '500',
  fontSize: 16,
},
title: {
  fontSize: 22,
  fontWeight: '700',
  color: '#111',
  marginBottom: 10,
  textAlign: 'center',
},

card: {
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 20,
  marginHorizontal: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
},

label: {
  fontSize: 16,
  fontWeight: '500',
  marginTop: 16,
  marginBottom: 6,
  color: '#333',
},
disabledButton: {
  backgroundColor: '#cccccc',
  opacity: 0.6,
},

disabledLink: {
  color: '#999999',
  textDecorationLine: 'none',
},

authorInfo: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 10,
},
authorAvatar: {
  width: 32,
  height: 32,
  borderRadius: 16,
  marginRight: 8,
},
authorTextContainer: {
  flexDirection: 'column',
},
postCategory: {
  marginTop: 8,
  fontSize: 14,
  fontWeight: 'bold',
  color: '#555',
},
mediaIcons: {
  flexDirection: 'row',
  marginTop: 8,
},
audioIcon: {
  marginRight: 10,
  fontSize: 14,
},
videoIcon: {
  fontSize: 14,
},
likeCommentSection: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 12,
},
likeText: {
  fontSize: 14,
},
commentText: {
  fontSize: 14,
},

profileButtonContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 4,
  borderRadius: 20,
  backgroundColor: '#f5f5f5',
},

profileNameText: {
  marginLeft: 8,
  marginRight: 8,
  fontSize: 14,
  color: '#333',
  fontWeight: '500',
},

dropdownProfileImage: {
  width: 40,
  height: 40,
  borderRadius: 20,
  marginRight: 12,
},

dropdownProfileInfo: {
  flex: 1,
},

dropdownProfileName: {
  fontSize: 14,
  fontWeight: '600',
  color: '#333',
  marginBottom: 2,
},

dropdownProfileEmail: {
  fontSize: 12,
  color: '#666',
},

activeTabButton: {
  backgroundColor: 'transparent',
},

});
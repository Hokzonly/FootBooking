export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface Translations {
  // Common
  loading: string;
  error: string;
  success: string;
  cancel: string;
  confirm: string;
  save: string;
  edit: string;
  delete: string;
  back: string;
  next: string;
  previous: string;
  search: string;
  filter: string;
  clear: string;
  apply: string;
  close: string;
  open: string;
  yes: string;
  no: string;
  
  // Navigation
  home: string;
  academies: string;
  bookings: string;
  profile: string;
  login: string;
  register: string;
  logout: string;
  tournaments: string;
  admin: string;
  welcome: string;
  
  // Home Page
  heroTitle: string;
  heroSubtitle: string;
  bookField: string;
  findFields: string;
  bookInClicks: string;
  featuresTitle: string;
  whyChooseUsTitle: string;
  
  // Features
  bookFieldsTitle: string;
  bookFieldsDesc: string;
  exploreProfilesTitle: string;
  exploreProfilesDesc: string;
  stayUpdatedTitle: string;
  stayUpdatedDesc: string;
  showcaseSkillsTitle: string;
  showcaseSkillsDesc: string;
  engageCommunityTitle: string;
  engageCommunityDesc: string;
  earnRewardsTitle: string;
  earnRewardsDesc: string;
  
  // Why Choose Us
  connectTitle: string;
  connectDesc: string;
  easyUseTitle: string;
  easyUseDesc: string;
  communityTitle: string;
  communityDesc: string;
  
  // Academy Details
  academyProfile: string;
  info: string;
  openingHours: string;
  location: string;
  gallery: string;
  monthlyMembership: string;
  bookField: string;
  contactInfo: string;
  operatingHours: string;
  
  // Booking
  bookFieldTitle: string;
  selectField: string;
  selectDate: string;
  selectTime: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailAddress: string;
  confirmBooking: string;
  bookingConfirmed: string;
  bookingFailed: string;
  available: string;
  booked: string;
  unavailable: string;
  
  // Pricing
  monthlyPrice: string;
  perMonth: string;
  whatsIncluded: string;
  unlimitedAccess: string;
  professionalCoaching: string;
  trainingEquipment: string;
  progressReports: string;
  priorityBooking: string;
  merchandiseDiscount: string;
  joinMembership: string;
  cancelAnytime: string;
  
  // Form validation
  required: string;
  invalidEmail: string;
  invalidPhone: string;
  fillAllFields: string;
}

export const languages: Language[] = [
  {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷'
  },
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸'
  }
];

export const translations: Record<string, Translations> = {
  fr: {
    // Common
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    save: 'Enregistrer',
    edit: 'Modifier',
    delete: 'Supprimer',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    search: 'Rechercher',
    filter: 'Filtrer',
    clear: 'Effacer',
    apply: 'Appliquer',
    close: 'Fermer',
    open: 'Ouvrir',
    yes: 'Oui',
    no: 'Non',
    
    // Navigation
    home: 'Accueil',
    academies: 'Académies',
    bookings: 'Réservations',
    profile: 'Profil',
    login: 'Connexion',
    register: 'Inscription',
    logout: 'Déconnexion',
    tournaments: 'Tournois',
    admin: 'Admin',
    welcome: 'Bienvenue',
    
    // Home Page
    heroTitle: 'FootBooking — Votre plateforme complète de réservation et communauté football',
    heroSubtitle: 'Découvrez et réservez les meilleurs terrains de football de votre ville. Rapide, facile et fiable.',
    bookField: 'Réserver un terrain',
    findFields: 'Trouvez des terrains de football près de chez vous',
    bookInClicks: 'Réservez votre prochain match en 3 clics',
    featuresTitle: 'Ce que vous pouvez faire avec FootBooking',
    whyChooseUsTitle: 'Pourquoi FootBooking ?',
    
    // Features
    bookFieldsTitle: 'Réservez facilement des terrains et sessions d\'entraînement',
    bookFieldsDesc: 'Trouvez et réservez votre place dans des académies locales de confiance avec un calendrier en ligne simple.',
    exploreProfilesTitle: 'Explorez des profils d\'académies détaillés',
    exploreProfilesDesc: 'Obtenez toutes les informations dont vous avez besoin — photos, vidéos, prix, entraîneurs et comment rejoindre.',
    stayUpdatedTitle: 'Restez informé des événements d\'académie',
    stayUpdatedDesc: 'Ne manquez jamais les matchs, essais ou tournois avec notre calendrier d\'événements centralisé.',
    showcaseSkillsTitle: 'Montrez vos compétences avec des clips et photos',
    showcaseSkillsDesc: 'Partagez vos meilleurs moments de jeu pour être présenté comme Clip de la semaine ou dans notre Galerie de joueurs.',
    engageCommunityTitle: 'Participez à une communauté football grandissante',
    engageCommunityDesc: 'Regardez les temps forts des matchs, suivez vos académies préférées et rejoignez les défis hebdomadaires.',
    earnRewardsTitle: 'Gagnez des récompenses et reconnaissance (Bientôt disponible)',
    earnRewardsDesc: 'Participez à des tournois, votez pour l\'homme du match et grimpez les classements.',
    
    // Why Choose Us
    connectTitle: 'Conçu pour connecter joueurs, parents et académies',
    connectDesc: 'Notre plateforme fait le pont entre les passionnés de football et les installations de qualité.',
    easyUseTitle: 'Conçu pour une utilisation facile, transparence et confiance',
    easyUseDesc: 'Processus de réservation simple avec des prix clairs et un service fiable.',
    communityTitle: 'Alimenté par une communauté passionnée et du contenu de qualité',
    communityDesc: 'Rejoignez des milliers d\'amateurs de football partageant leur passion pour le beau jeu.',
    
    // Academy Details
    academyProfile: 'Page de profil d\'académie',
    info: 'Informations',
    openingHours: 'Heures d\'ouverture',
    location: 'Emplacement',
    gallery: 'Galerie',
    monthlyMembership: 'Adhésion mensuelle',
    bookField: 'Réserver un terrain',
    contactInfo: 'Informations de contact',
    operatingHours: 'Heures d\'ouverture',
    
    // Booking
    bookFieldTitle: 'Réserver un terrain',
    selectField: 'Sélectionner un terrain',
    selectDate: 'Sélectionner une date',
    selectTime: 'Sélectionner une heure',
    firstName: 'Prénom',
    lastName: 'Nom de famille',
    phoneNumber: 'Numéro de téléphone',
    emailAddress: 'Adresse e-mail',
    confirmBooking: 'Confirmer la réservation',
    bookingConfirmed: 'Réservation confirmée avec succès ! ⚽',
    bookingFailed: 'Échec de la réservation',
    available: 'Disponible',
    booked: 'Réservé',
    unavailable: 'Indisponible',
    
    // Pricing
    monthlyPrice: 'Prix mensuel',
    perMonth: '/mois',
    whatsIncluded: 'Ce qui est inclus :',
    unlimitedAccess: 'Accès illimité aux terrains',
    professionalCoaching: 'Entraînement professionnel',
    trainingEquipment: 'Équipement d\'entraînement fourni',
    progressReports: 'Rapports de progression mensuels',
    priorityBooking: 'Réservation prioritaire',
    merchandiseDiscount: 'Réduction sur les articles de l\'académie',
    joinMembership: 'Rejoindre l\'adhésion mensuelle',
    cancelAnytime: 'Annulez à tout moment • Pas d\'engagement à long terme',
    
    // Form validation
    required: 'Champ requis',
    invalidEmail: 'Adresse e-mail invalide',
    invalidPhone: 'Numéro de téléphone invalide',
    fillAllFields: 'Veuillez remplir tous les champs requis'
  },
  en: {
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    apply: 'Apply',
    close: 'Close',
    open: 'Open',
    yes: 'Yes',
    no: 'No',
    
    // Navigation
    home: 'Home',
    academies: 'Academies',
    bookings: 'Bookings',
    profile: 'Profile',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    tournaments: 'Tournaments',
    admin: 'Admin',
    welcome: 'Welcome',
    
    // Home Page
    heroTitle: 'FootBooking — Your All-in-One Football Booking & Community Platform',
    heroSubtitle: 'Discover and reserve the best football fields in your city. Fast, easy, and reliable.',
    bookField: 'Book a Field',
    findFields: 'Find Football Fields Near You',
    bookInClicks: 'Book your next game in 3 clicks',
    featuresTitle: 'What You Can Do with FootBooking',
    whyChooseUsTitle: 'Why FootBooking?',
    
    // Features
    bookFieldsTitle: 'Easily Book Football Fields & Training Sessions',
    bookFieldsDesc: 'Find and reserve your spot at trusted local academies with a simple online calendar.',
    exploreProfilesTitle: 'Explore Detailed Academy Profiles',
    exploreProfilesDesc: 'Get all the info you need — photos, videos, prices, coaches, and how to join.',
    stayUpdatedTitle: 'Stay Updated with Academy Events',
    stayUpdatedDesc: 'Never miss matches, tryouts, or tournaments with our centralized event calendar.',
    showcaseSkillsTitle: 'Showcase Your Skills with Clip & Photo Submissions',
    showcaseSkillsDesc: 'Share your best game moments to be featured as Clip of the Week or in our Player Gallery.',
    engageCommunityTitle: 'Engage with a Growing Football Community',
    engageCommunityDesc: 'Watch game highlights, follow your favorite academies, and join weekly challenges.',
    earnRewardsTitle: 'Earn Rewards & Recognition (Coming Soon)',
    earnRewardsDesc: 'Compete in tournaments, vote for Man of the Match, and climb the leaderboards.',
    
    // Why Choose Us
    connectTitle: 'Built to connect players, parents, and academies',
    connectDesc: 'Our platform bridges the gap between football enthusiasts and quality facilities.',
    easyUseTitle: 'Designed for easy use, transparency, and trust',
    easyUseDesc: 'Simple booking process with clear pricing and reliable service.',
    communityTitle: 'Powered by a passionate community and quality content',
    communityDesc: 'Join thousands of football lovers sharing their passion for the beautiful game.',
    
    // Academy Details
    academyProfile: 'Academy Profile Page',
    info: 'Info',
    openingHours: 'Opening Hours',
    location: 'Location',
    gallery: 'Gallery',
    monthlyMembership: 'Monthly Membership',
    bookField: 'Book a Field',
    contactInfo: 'Contact Information',
    operatingHours: 'Operating Hours',
    
    // Booking
    bookFieldTitle: 'Book a Field',
    selectField: 'Select Field',
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    firstName: 'First Name',
    lastName: 'Last Name',
    phoneNumber: 'Phone Number',
    emailAddress: 'Email Address',
    confirmBooking: 'Confirm Booking',
    bookingConfirmed: 'Booking confirmed successfully! ⚽',
    bookingFailed: 'Booking failed',
    available: 'Available',
    booked: 'Booked',
    unavailable: 'Unavailable',
    
    // Pricing
    monthlyPrice: 'Monthly Price',
    perMonth: '/month',
    whatsIncluded: 'What\'s included:',
    unlimitedAccess: 'Unlimited field access',
    professionalCoaching: 'Professional coaching',
    trainingEquipment: 'Training equipment provided',
    progressReports: 'Monthly progress reports',
    priorityBooking: 'Priority booking',
    merchandiseDiscount: 'Academy merchandise discount',
    joinMembership: 'Join Monthly Membership',
    cancelAnytime: 'Cancel anytime • No long-term commitment',
    
    // Form validation
    required: 'Required field',
    invalidEmail: 'Invalid email address',
    invalidPhone: 'Invalid phone number',
    fillAllFields: 'Please fill in all required fields'
  }
};

export const defaultLanguage = 'fr'; 
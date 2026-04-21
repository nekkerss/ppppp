export const servicesData = {
  auto: {
    type: "auto",
    title: "Auto Insurance",
    label: "Assurance Auto",
    shortDescription:
      "Protection complete pour votre vehicule, vos passagers et votre mobilite quotidienne.",
    fullDescription:
      "Notre assurance auto vous accompagne a chaque trajet avec une couverture modulable: responsabilite civile, dommages tous accidents, assistance 24/7 et protection juridique. Que vous soyez conducteur occasionnel ou professionnel, nous adaptons votre contrat a votre profil et a la valeur de votre vehicule.",
    image:
      "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1400&q=80",
    benefits: [
      "Assistance depannage rapide 24/7 sur tout le territoire.",
      "Prise en charge des dommages materiels et corporels.",
      "Vehicule de remplacement selon votre formule.",
      "Gestion digitale des sinistres et suivi en temps reel."
    ]
  },
  health: {
    type: "health",
    title: "Health Insurance",
    label: "Assurance Sante",
    shortDescription:
      "Une couverture sante complete pour vous et votre famille avec un acces simplifie aux soins.",
    fullDescription:
      "Notre assurance sante combine prevention, remboursement rapide et reseau de partenaires medicaux pour vous offrir une experience sereine. Vous beneficiez de garanties claires sur les consultations, hospitalisations, soins specialises et medicaments, avec des options renforcees selon vos besoins.",
    image:
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1400&q=80",
    benefits: [
      "Remboursement optimise des soins courants et specialises.",
      "Acces a un reseau de cliniques et medecins partenaires.",
      "Formules familiales avec niveaux de garantie flexibles.",
      "Accompagnement prevention et teleconsultation."
    ]
  },
  home: {
    type: "home",
    title: "Home Insurance",
    label: "Assurance Habitation",
    shortDescription:
      "Proteger votre logement et vos biens contre les risques du quotidien.",
    fullDescription:
      "Notre assurance habitation couvre votre residence principale ou secondaire contre les degats des eaux, incendies, vols et catastrophes naturelles. En cas d'incident, vous profitez d'une declaration simplifiee, d'une prise en charge rapide et d'un accompagnement personnalise jusqu'a la remise en etat.",
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=80",
    benefits: [
      "Protection des biens mobiliers et immobiliers.",
      "Garantie responsabilite civile pour toute la famille.",
      "Indemnisation rapide avec experts dedies.",
      "Options complementaires pour objets de valeur."
    ]
  },
  travel: {
    type: "travel",
    title: "Travel Insurance",
    label: "Assurance Voyage",
    shortDescription:
      "Couverture voyage pour vos deplacements, annulations et urgences medicales.",
    fullDescription:
      "Notre assurance voyage vous accompagne en France et a l'international: assistance medicale, rapatriement, perte de bagages, retard de vol et annulation. Des formules flexibles pour vacanciers, etudiants et professionnels.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    benefits: [
      "Assistance medicale 24/7 a l'international.",
      "Rapatriement et prise en charge des frais urgents.",
      "Indemnisation bagages perdus ou retardes.",
      "Couverture annulation et interruption de voyage."
    ]
  },
  life: {
    type: "life",
    title: "Life Insurance",
    label: "Assurance Vie",
    shortDescription:
      "Epargne, protection familiale et transmission de capital en toute serenite.",
    fullDescription:
      "Notre assurance vie vous permet de proteger vos proches tout en preparant l'avenir. Vous choisissez votre niveau de couverture, vos beneficiaires et des options d'epargne flexibles avec un accompagnement personnalise.",
    image:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1400&q=80",
    benefits: [
      "Protection financiere pour vos proches.",
      "Options d'epargne et de transmission du capital.",
      "Formules adaptees a votre budget.",
      "Conseil personnalise pour vos objectifs." 
    ]
  }
};

export const serviceTypes = Object.keys(servicesData);

<script>
/* =====================================================================
   Mojave Medical — content model (English / Spanish)
   Every fact below is sourced from public directories, the NPI registry,
   PubMed, and the practice's own Yelp listing (Sept 2026). Items marked
   [confirm] in PLAN.md should be verified with Dr. Ganesh before launch.
   ===================================================================== */
const PHONE = "(760) 688-0084", PHONE_TEL = "tel:+17606880084", FAX = "(760) 688-0470", EMAIL = "mojavemedicalclinic@gmail.com";
// Address per the practice's own Google Business Profile ("Kevin Ganesh MD - Mojave Medical",
// place /g/11y3n827gf, pin 34.5424965,-117.2710243). The CMS NPI record still shows the older
// 15982 Tuscola Rd Ste B address and should be updated by the practice. See PLAN.md.
const ADDRESS = {
  line1: "16041 Kamana Rd",
  city: "Apple Valley, CA 92307",
  lat: 34.5424965, lng: -117.2710243,
  maps: "https://maps.app.goo.gl/DbtFrS5e8HJmHmsR6",
  dir: "https://www.google.com/maps/dir/?api=1&destination=16041+Kamana+Rd%2C+Apple+Valley%2C+CA+92307"
};

const C = {
  nav: [
    { id: "about",    en: "About Dr. Ganesh",      es: "El Dr. Ganesh" },
    { id: "services", en: "Conditions",            es: "Condiciones" },
    { id: "patients", en: "Patients",              es: "Pacientes" },
    { id: "reviews",  en: "Reviews",               es: "Opiniones" },
    { id: "contact",  en: "Contact",               es: "Contacto" }
  ],
  titles: {
    home: { en: "Infectious Disease & Internal Medicine, Apple Valley", es: "Enfermedades infecciosas y medicina interna, Apple Valley" },
    about: { en: "About Dr. Ganesh", es: "Sobre el Dr. Ganesh" },
    services: { en: "Conditions & Services", es: "Condiciones y servicios" },
    patients: { en: "Patient Information", es: "Información para pacientes" },
    reviews: { en: "Patient Reviews", es: "Opiniones de pacientes" },
    contact: { en: "Contact & Directions", es: "Contacto y cómo llegar" },
    book: { en: "Book an Appointment", es: "Reservar una cita" },
    privacy: { en: "Privacy Policy", es: "Política de privacidad" },
    accessibility: { en: "Accessibility", es: "Accesibilidad" },
    forms: { en: "Patient Forms", es: "Formularios para pacientes" }
  },
  ui: {
    book: { en: "Book appointment", es: "Reservar cita" },
    bookShort: { en: "Book", es: "Reservar" },
    call: { en: "Call", es: "Llamar" },
    callUs: { en: "Call " + PHONE, es: "Llamar al " + PHONE },
    learn: { en: "Learn more", es: "Más información" },
    seeAll: { en: "See all conditions", es: "Ver todas las condiciones" },
    directions: { en: "Get directions", es: "Cómo llegar" },
    openMaps: { en: "Open in Google Maps", es: "Abrir en Google Maps" },
    telehealth: { en: "Video visit", es: "Consulta por video" },
    hoursTitle: { en: "Office hours", es: "Horario" },
    today: { en: "today", es: "hoy" },
    closed: { en: "Closed", es: "Cerrado" },
    days: { en: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], es: ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"] },
    dow: { en: ["Su","Mo","Tu","We","Th","Fr","Sa"], es: ["Do","Lu","Ma","Mi","Ju","Vi","Sá"] },
    months: { en: ["January","February","March","April","May","June","July","August","September","October","November","December"], es: ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"] },
    menu: { en: "Menu", es: "Menú" },
    viaYelp: { en: "via Yelp", es: "vía Yelp (original en inglés)" },
    readReviews: { en: "Read patient reviews", es: "Leer opiniones" },
    skip: { en: "Skip to content", es: "Ir al contenido" }
  },

  hero: {
    eyebrow: { en: "Infectious Disease & Internal Medicine · Apple Valley, CA", es: "Enfermedades infecciosas y medicina interna · Apple Valley, CA" },
    h1a: { en: "Expert care for complex infections,", es: "Atención experta para infecciones complejas," },
    h1b: { en: "right here in the High Desert.", es: "aquí mismo en el High Desert." },
    lede: { en: "Dr. Kevin Ganesh is a board-certified infectious disease physician and internist. He treats stubborn wound and bone infections, HIV, hepatitis, Valley Fever and more, at his Apple Valley clinic and by video, so you don't have to drive down the hill for specialist care.",
            es: "El Dr. Kevin Ganesh es médico internista con certificación en enfermedades infecciosas. Trata infecciones difíciles de heridas y huesos, VIH, hepatitis, fiebre del valle y más, en su clínica de Apple Valley y por video, para que no tenga que bajar la montaña para ver a un especialista." },
    chips: [
      { en: "Double board-certified (ABIM)", es: "Doble certificación (ABIM)" },
      { en: "On staff at 3 High Desert hospitals", es: "Privilegios en 3 hospitales del High Desert" },
      { en: "Accepting new patients", es: "Aceptamos pacientes nuevos" },
      { en: "Video visits available", es: "Consultas por video" }
    ],
    tagName: "Kevin N. Ganesh, MD",
    tagRole: { en: "Infectious Disease · Internal Medicine", es: "Infectología · Medicina interna" }
  },

  strips: [
    { label: { en: "On staff at", es: "Privilegios en" }, items: ["Providence St. Mary Medical Center", "Desert Valley Hospital", "Victor Valley Global Medical Center"] },
    { label: { en: "Trained at", es: "Formación en" }, items: ["Eastern Virginia Medical School", "VCU Health, Richmond", "Keck School of Medicine of USC · LA General"] }
  ],

  treat: {
    eyebrow: { en: "What we treat", es: "Qué tratamos" },
    h2: { en: "The infections other clinics refer out.", es: "Las infecciones que otras clínicas refieren a especialistas." },
    lede: { en: "Dr. Ganesh sees the cases that need a subspecialist: infections that keep coming back, need long courses of antibiotics, or follow a hospital stay. He also offers everyday internal medicine for patients who want one doctor for both.",
            es: "El Dr. Ganesh atiende los casos que requieren un subespecialista: infecciones que regresan, que necesitan antibióticos por largo tiempo o que siguen a una hospitalización. También ofrece medicina interna para quienes quieren un solo médico para ambas cosas." },
    big: { h: { en: "Wound, skin & bone infections", es: "Infecciones de heridas, piel y hueso" },
           p: { en: "Cellulitis, diabetic foot infections, infected surgical wounds and osteomyelitis, with wound care done in the office. These are the conditions Dr. Ganesh treats most often.",
                es: "Celulitis, infecciones del pie diabético, heridas quirúrgicas infectadas y osteomielitis, con curación de heridas en el consultorio. Son las condiciones que el Dr. Ganesh trata con más frecuencia." },
           tags: [{ en: "Cellulitis", es: "Celulitis" }, { en: "Diabetic foot", es: "Pie diabético" }, { en: "Osteomyelitis", es: "Osteomielitis" }, { en: "Post-surgical", es: "Posquirúrgicas" }, { en: "MRSA", es: "MRSA" }] },
    tiles: [
      { ico: "hospital", h: { en: "After a hospital stay", es: "Después del hospital" }, p: { en: "Sepsis, bloodstream and heart-valve infection follow-up, and monitoring of IV antibiotics at home.", es: "Seguimiento de sepsis, infecciones de la sangre y de válvulas cardíacas, y control de antibióticos IV en casa." } },
      { ico: "ribbon", h: { en: "HIV care & PrEP", es: "VIH y PrEP" }, p: { en: "Modern treatment, confidential testing and prevention.", es: "Tratamiento moderno, pruebas confidenciales y prevención." } },
      { ico: "liver", h: { en: "Hepatitis B & C", es: "Hepatitis B y C" }, p: { en: "Monitoring and curative hepatitis C therapy.", es: "Seguimiento y tratamiento curativo de la hepatitis C." } },
      { ico: "fungus", h: { en: "Valley Fever & fungal", es: "Fiebre del valle y hongos" }, p: { en: "Coccidioidomycosis lives in High Desert soil. We know it well.", es: "La coccidioidomicosis vive en el suelo del High Desert. La conocemos bien." } },
      { ico: "plane", h: { en: "Travel medicine", es: "Medicina del viajero" }, p: { en: "Pre-travel consults, vaccines and malaria prevention.", es: "Consultas previas al viaje, vacunas y prevención de malaria." } },
      { ico: "stetho", sand: true, h: { en: "Internal medicine", es: "Medicina interna" }, p: { en: "Annual exams, diabetes, blood pressure and vaccinations for established patients.", es: "Exámenes anuales, diabetes, presión arterial y vacunas para pacientes establecidos." } }
    ]
  },

  steps: {
    eyebrow: { en: "How a visit works", es: "Cómo funciona una visita" },
    h2: { en: "Three steps from worried to a plan.", es: "Tres pasos de la preocupación a un plan." },
    items: [
      { h: { en: "Book online or call", es: "Reserve en línea o llame" }, p: { en: "Choose an office visit or a video visit. HMO patients usually need a referral from their primary doctor; Medicare and PPO patients can book directly.", es: "Elija una visita en el consultorio o por video. Los pacientes con HMO normalmente necesitan una referencia de su médico de cabecera; con Medicare o PPO puede reservar directamente." } },
      { h: { en: "Bring your records", es: "Traiga sus documentos" }, p: { en: "Your referral, hospital discharge papers, recent labs or cultures, a list of your medications, and your insurance card. Photos of a wound help too.", es: "Su referencia, papeles de alta del hospital, laboratorios o cultivos recientes, la lista de sus medicamentos y su tarjeta de seguro. Las fotos de una herida también ayudan." } },
      { h: { en: "Leave with a plan you understand", es: "Salga con un plan que entienda" }, p: { en: "Dr. Ganesh reviews everything, explains the diagnosis in plain language, and coordinates with your hospital team and primary doctor.", es: "El Dr. Ganesh revisa todo, explica el diagnóstico en lenguaje sencillo y coordina con su equipo del hospital y su médico de cabecera." } }
    ]
  },

  cred: {
    eyebrow: { en: "Your physician", es: "Su médico" },
    h2: { en: "Meet Dr. Kevin Ganesh", es: "Conozca al Dr. Kevin Ganesh" },
    p: { en: "Fellowship-trained at one of the largest public hospitals in the country, Dr. Ganesh brings university-hospital infectious disease expertise to a small, independent clinic in Apple Valley.",
         es: "Con formación de subespecialidad en uno de los hospitales públicos más grandes del país, el Dr. Ganesh trae la experiencia infectológica de un hospital universitario a una clínica pequeña e independiente en Apple Valley." },
    facts: [
      { b: { en: "Board-certified, Infectious Disease", es: "Certificado en Infectología" }, s: "American Board of Internal Medicine", amber: true },
      { b: { en: "Board-certified, Internal Medicine", es: "Certificado en Medicina Interna" }, s: "American Board of Internal Medicine" },
      { b: { en: "ID fellowship, Keck School of Medicine of USC", es: "Subespecialidad en Keck School of Medicine de USC" }, s: { en: "Los Angeles General Medical Center, 2020–2022", es: "Los Angeles General Medical Center, 2020–2022" } },
      { b: { en: "Published HIV researcher", es: "Investigador publicado en VIH" }, s: "Journal of Clinical Virology, 2024" }
    ],
    cta: { en: "Full biography", es: "Biografía completa" }
  },

  reviews: {
    eyebrow: { en: "Patient reviews", es: "Opiniones de pacientes" },
    h2: { en: "Diagnosed right, explained clearly.", es: "Diagnóstico correcto, explicación clara." },
    hgLabel: { en: "Healthgrades patient rating", es: "Calificación en Healthgrades" },
    yelpLabel: { en: "Yelp rating", es: "Calificación en Yelp" },
    items: [
      { who: "Mr. B.", when: "June 2024", stars: 5, q: "Finding a competent and experienced doctor is difficult, but if you've found this then you've struck gold. Dr. Ganesh was professional, timely, courteous, calm, and ensured that all of my needs were met during all of my in and out patient visits. Most importantly, he was able to make an accurate diagnosis." },
      { who: "George I.", when: "July 2024", stars: 5, q: "Dr. Ganesh diagnosed me and got me feeling better than I had ever felt. If I'm ever in the area and I'm not feeling good, Dr. Ganesh can expect me to be there again!" },
      { who: "Tiffany H.", when: "July 2024", stars: 5, q: "After two visits and a few Rx, I was good as new. Staff easy going and the doctor seemed experienced and friendly. If I do need to go to the doctor again, I would go here!" }
    ],
    leave: { en: "Leave a review on Google", es: "Dejar una opinión en Google" }
  },

  insurance: {
    eyebrow: { en: "Insurance", es: "Seguros" },
    h2: { en: "Most HMO, PPO and Medicare Advantage plans accepted.", es: "Aceptamos la mayoría de planes HMO, PPO y Medicare Advantage." },
    p: { en: "Plan lists change often. Call the office with your card and we'll confirm your coverage before your visit.", es: "Las listas de planes cambian con frecuencia. Llame al consultorio con su tarjeta y confirmaremos su cobertura antes de la visita." },
    carriers: ["Aetna", "Anthem Blue Cross", "Blue Shield of California", "Blue Cross Blue Shield PPO", "Cigna", "Health Net", "UnitedHealthcare", "Molina Healthcare", "Oscar Health", "CareMore Medicare Advantage", "Blue Shield Medicare Advantage", "Health Net Medicare Advantage"]
  },

  location: {
    eyebrow: { en: "Visit us", es: "Visítenos" },
    h2: { en: "On Kamana Road, minutes from St. Mary.", es: "En Kamana Road, a minutos de St. Mary." },
    hours: [ // 0=Sun … 6=Sat
      { d: 1, en: "8:00 AM – 5:00 PM", es: "8:00 – 17:00" },
      { d: 2, en: "8:00 AM – 5:00 PM", es: "8:00 – 17:00" },
      { d: 3, en: "8:00 AM – 5:00 PM", es: "8:00 – 17:00" },
      { d: 4, en: "8:00 AM – 5:00 PM", es: "8:00 – 17:00" },
      { d: 5, en: "8:00 AM – 5:00 PM", es: "8:00 – 17:00" },
      { d: 6, en: "1:00 PM – 5:00 PM", es: "13:00 – 17:00" },
      { d: 0, en: null, es: null }
    ],
    mapNote: { en: "Free parking on site. Tap the map for directions.", es: "Estacionamiento gratuito. Toque el mapa para llegar." },
    photoAlt: { en: "The Mojave Medical entrance on Kamana Road, with the practice sign and street number 16041", es: "La entrada de Mojave Medical en Kamana Road, con el letrero y el número 16041" },
    photoCap: { en: "Look for the Mojave Medical sign and the number 16041. Park at the door.", es: "Busque el letrero de Mojave Medical y el número 16041. Estacione junto a la entrada." },
    signTag: { en: "Infections, Wounds, Primary Care and More", es: "Infecciones, heridas, atención primaria y más" }
  },

  band: {
    h2: { en: "Referred by your hospital or doctor? We'll get you in this week.", es: "¿Lo refirió su hospital o su médico? Lo atendemos esta misma semana." },
    p: { en: "Post-discharge patients are seen quickly so antibiotics stay on track. Book online, or call and mention your discharge date.", es: "Los pacientes recién dados de alta se atienden rápido para que los antibióticos sigan su curso. Reserve en línea o llame y mencione su fecha de alta." }
  },

  refer: {
    eyebrow: { en: "For referring physicians", es: "Para médicos que refieren" },
    h2: { en: "Consults and post-discharge follow-up, without the drive to Loma Linda.", es: "Consultas y seguimiento posalta, sin el viaje a Loma Linda." },
    p: { en: "Dr. Ganesh rounds at Providence St. Mary, Desert Valley Hospital and Victor Valley Global Medical Center and follows patients in clinic after discharge. Fax referrals with recent cultures, imaging and discharge summary.",
         es: "El Dr. Ganesh hace rondas en Providence St. Mary, Desert Valley Hospital y Victor Valley Global Medical Center y da seguimiento en la clínica tras el alta. Envíe referencias por fax con cultivos recientes, imágenes y resumen de alta." }
  },

  about: {
    lede: { en: "Board-certified in infectious disease and internal medicine. Trained in Virginia and Los Angeles. Practicing in Apple Valley.", es: "Certificado en infectología y medicina interna. Formado en Virginia y Los Ángeles. Con consulta en Apple Valley." },
    bio: {
      en: [
        "Kevin N. Ganesh, MD, is a physician double board-certified by the American Board of Internal Medicine in Infectious Disease and in Internal Medicine. He founded Mojave Medical in Apple Valley to bring subspecialty infection care to the High Desert, where patients have long had to travel down the Cajon Pass to find it.",
        "He earned his medical degree at Eastern Virginia Medical School in Norfolk (2017), completed his internal medicine residency at VCU Health in Richmond (2020), and trained as an infectious disease fellow at the Keck School of Medicine of USC and Los Angeles General Medical Center (2022), one of the largest public hospitals in the country. During fellowship he co-authored research on portable nanopore sequencing for HIV drug-resistance testing, published in the Journal of Clinical Virology in 2024.",
        "Since 2022 Dr. Ganesh has held privileges at Providence St. Mary Medical Center in Apple Valley and at Desert Valley Hospital and Victor Valley Global Medical Center in Victorville, where he consults on hospitalized patients with serious infections and then follows them in clinic after discharge. In the office he pairs that specialist lens with everyday internal medicine, so patients can keep one doctor for both."
      ],
      es: [
        "El Dr. Kevin N. Ganesh es médico con doble certificación del American Board of Internal Medicine en Enfermedades Infecciosas y en Medicina Interna. Fundó Mojave Medical en Apple Valley para traer al High Desert la atención subespecializada en infecciones que durante años obligó a los pacientes a bajar por el Cajon Pass para encontrarla.",
        "Obtuvo su título de médico en Eastern Virginia Medical School en Norfolk (2017), completó su residencia de medicina interna en VCU Health en Richmond (2020) y se formó como fellow de enfermedades infecciosas en la Keck School of Medicine de USC y el Los Angeles General Medical Center (2022), uno de los hospitales públicos más grandes del país. Durante el fellowship fue coautor de una investigación sobre secuenciación portátil por nanoporos para pruebas de resistencia a medicamentos del VIH, publicada en el Journal of Clinical Virology en 2024.",
        "Desde 2022 el Dr. Ganesh tiene privilegios en Providence St. Mary Medical Center en Apple Valley y en Desert Valley Hospital y Victor Valley Global Medical Center en Victorville, donde atiende en interconsulta a pacientes hospitalizados con infecciones graves y luego les da seguimiento en la clínica tras el alta. En el consultorio combina esa mirada de especialista con la medicina interna cotidiana, para que los pacientes puedan tener un solo médico para ambas cosas."
      ]
    },
    pull: { en: "Get the diagnosis right first. Use the narrowest antibiotic that works. Explain the plan in plain language.", es: "Primero el diagnóstico correcto. Luego el antibiótico más específico que funcione. Y siempre, un plan explicado en lenguaje sencillo." },
    pullLabel: { en: "How Dr. Ganesh practices", es: "Cómo ejerce el Dr. Ganesh" },
    tlTitle: { en: "Training & career", es: "Formación y trayectoria" },
    timeline: [
      { yr: "2013–2017", b: { en: "Doctor of Medicine", es: "Título de médico" }, s: "Eastern Virginia Medical School, Norfolk, VA" },
      { yr: "2017–2020", b: { en: "Internal Medicine residency", es: "Residencia en medicina interna" }, s: "VCU Health / Medical College of Virginia, Richmond, VA" },
      { yr: "2020–2022", b: { en: "Infectious Disease fellowship", es: "Fellowship en enfermedades infecciosas" }, s: "Keck School of Medicine of USC · Los Angeles General Medical Center" },
      { yr: "2022 –", b: { en: "Mojave Medical, Apple Valley", es: "Mojave Medical, Apple Valley" }, s: { en: "Private practice; medical staff at St. Mary, Desert Valley and Victor Valley Global", es: "Consulta privada; personal médico en St. Mary, Desert Valley y Victor Valley Global" } }
    ],
    credTitle: { en: "Certifications & licensure", es: "Certificaciones y licencia" },
    creds: [
      { b: { en: "Infectious Disease", es: "Enfermedades infecciosas" }, s: { en: "Board certification, American Board of Internal Medicine", es: "Certificación, American Board of Internal Medicine" } },
      { b: { en: "Internal Medicine", es: "Medicina interna" }, s: { en: "Board certification, American Board of Internal Medicine", es: "Certificación, American Board of Internal Medicine" } },
      { b: { en: "California medical license A169955", es: "Licencia médica de California A169955" }, s: { en: "Medical Board of California · NPI 1225563026", es: "Medical Board of California · NPI 1225563026" } }
    ],
    pubTitle: { en: "Selected publication", es: "Publicación seleccionada" },
    pub: { t: "Portable Nanopore sequencing solution for next-generation HIV drug resistance testing.", a: "Park SY, Faraci G, Ganesh K, Dubé MP, Lee HY.", j: "Journal of Clinical Virology, April 2024. PMID 38219684." },
    hospTitle: { en: "Hospital medical staff", es: "Personal médico hospitalario" },
    hosp: ["Providence St. Mary Medical Center, Apple Valley", "Desert Valley Hospital, Victorville", "Victor Valley Global Medical Center, Victorville"]
  },

  services: {
    lede: { en: "Two kinds of care under one roof: subspecialty infectious disease, and the internal medicine that keeps you well between visits.", es: "Dos tipos de atención bajo un mismo techo: infectología subespecializada y la medicina interna que lo mantiene bien entre visitas." },
    groups: [
      { eyebrow: { en: "Infectious disease", es: "Enfermedades infecciosas" }, h2: { en: "Specialist care for infections that won't quit.", es: "Atención especializada para infecciones que no ceden." },
        p: { en: "Most patients arrive by referral from a hospital, a surgeon or a primary care doctor. Self-referrals are welcome for PPO, Medicare and self-pay patients.", es: "La mayoría de los pacientes llegan referidos por un hospital, un cirujano o un médico de cabecera. Con PPO, Medicare o pago directo puede pedir cita sin referencia." },
        items: [
          { ico: "wound", hi: true, h: { en: "Wound & skin infections", es: "Infecciones de heridas y piel" }, p: { en: "Cellulitis, abscesses, infected surgical wounds and diabetic foot infections, with wound care done in the office.", es: "Celulitis, abscesos, heridas quirúrgicas infectadas e infecciones del pie diabético, con curación de heridas en el consultorio." }, pill: { en: "Most common", es: "Más frecuente" } },
          { ico: "bone", hi: true, h: { en: "Bone & joint infections", es: "Infecciones de hueso y articulaciones" }, p: { en: "Osteomyelitis, prosthetic joint infections and septic arthritis, including long-course antibiotic management.", es: "Osteomielitis, infecciones de prótesis articulares y artritis séptica, incluido el manejo de antibióticos de largo plazo." } },
          { ico: "hospital", h: { en: "After a hospital stay", es: "Después de una hospitalización" }, p: { en: "Follow-up for sepsis, bloodstream infections, endocarditis and pneumonia, and monitoring of home IV antibiotics (OPAT).", es: "Seguimiento tras sepsis, infecciones de la sangre, endocarditis y neumonía, y control de antibióticos intravenosos en casa (OPAT)." } },
          { ico: "ribbon", h: { en: "HIV care & PrEP", es: "VIH y PrEP" }, p: { en: "Modern HIV treatment, confidential testing, and PrEP to prevent infection.", es: "Tratamiento moderno del VIH, pruebas confidenciales y PrEP para prevenir la infección." } },
          { ico: "liver", h: { en: "Hepatitis B & C", es: "Hepatitis B y C" }, p: { en: "Evaluation, monitoring and curative hepatitis C therapy.", es: "Evaluación, seguimiento y tratamiento curativo de la hepatitis C." } },
          { ico: "fungus", h: { en: "Valley Fever & fungal infections", es: "Fiebre del valle e infecciones por hongos" }, p: { en: "Coccidioidomycosis is common in High Desert soil. We diagnose and manage it along with other fungal infections.", es: "La coccidioidomicosis es común en el suelo del High Desert. La diagnosticamos y tratamos junto con otras infecciones por hongos." } },
          { ico: "lung", h: { en: "Tuberculosis", es: "Tuberculosis" }, p: { en: "Latent and active TB evaluation and treatment, coordinated with public health.", es: "Evaluación y tratamiento de tuberculosis latente y activa, en coordinación con salud pública." } },
          { ico: "lock", h: { en: "Sexually transmitted infections", es: "Infecciones de transmisión sexual" }, p: { en: "Testing and treatment for syphilis, gonorrhea, chlamydia, herpes and more, handled discreetly.", es: "Pruebas y tratamiento de sífilis, gonorrea, clamidia, herpes y más, con total discreción." } },
          { ico: "fever", h: { en: "Fevers without a clear cause", es: "Fiebre sin causa clara" }, p: { en: "Second opinions and workups for persistent fever, recurring infections and unusual lab results.", es: "Segundas opiniones y estudios para fiebre persistente, infecciones recurrentes y resultados de laboratorio inusuales." } },
          { ico: "plane", h: { en: "Travel medicine", es: "Medicina del viajero" }, p: { en: "Pre-travel consults, vaccines, and prescriptions for malaria prevention and traveler's diarrhea.", es: "Consultas antes de viajar, vacunas y recetas para prevenir malaria y diarrea del viajero." } },
          { ico: "tick", h: { en: "Bites & tick-borne illness", es: "Mordeduras y enfermedades por garrapatas" }, p: { en: "Lyme disease, animal and insect bites, and guidance after possible rabies exposure.", es: "Enfermedad de Lyme, mordeduras de animales e insectos y orientación tras posible exposición a la rabia." } },
          { ico: "immune", h: { en: "Weakened immune systems", es: "Sistema inmune debilitado" }, p: { en: "Infection care and prevention for patients on chemotherapy, biologics or transplant medicines.", es: "Atención y prevención de infecciones para pacientes en quimioterapia, biológicos o medicamentos de trasplante." } }
        ] },
      { eyebrow: { en: "Internal medicine", es: "Medicina interna" }, h2: { en: "Everyday care from a doctor who already knows your history.", es: "Atención cotidiana de un médico que ya conoce su historial." },
        p: { en: "Established patients can use Mojave Medical for primary care, so the specialist who treated your infection also manages your diabetes and blood pressure.", es: "Los pacientes establecidos pueden usar Mojave Medical como atención primaria, para que el especialista que trató su infección también maneje su diabetes y presión arterial." },
        items: [
          { ico: "stetho", h: { en: "Annual physicals & preventive care", es: "Exámenes anuales y prevención" }, p: { en: "Wellness visits, screenings and Medicare annual wellness exams.", es: "Visitas de bienestar, exámenes de detección y exámenes anuales de Medicare." } },
          { ico: "drop", h: { en: "Diabetes", es: "Diabetes" }, p: { en: "Ongoing management, with special attention to foot and skin infection prevention.", es: "Manejo continuo, con atención especial a la prevención de infecciones del pie y la piel." } },
          { ico: "heart", h: { en: "Blood pressure & cholesterol", es: "Presión arterial y colesterol" }, p: { en: "Hypertension and lipid management with clear targets.", es: "Manejo de hipertensión y lípidos con metas claras." } },
          { ico: "syringe", h: { en: "Vaccinations", es: "Vacunas" }, p: { en: "Flu, COVID-19, shingles, pneumonia, hepatitis, HPV and travel vaccines.", es: "Influenza, COVID-19, herpes zóster, neumonía, hepatitis, VPH y vacunas para viajes." } },
          { ico: "pulse", h: { en: "Chronic conditions", es: "Enfermedades crónicas" }, p: { en: "COPD, kidney disease and other long-term conditions, coordinated with your specialists.", es: "EPOC, enfermedad renal y otras condiciones de largo plazo, en coordinación con sus especialistas." } },
          { ico: "video", h: { en: "Video visits", es: "Consultas por video" }, p: { en: "Follow-ups, results reviews and medication checks from home, anywhere in California.", es: "Seguimientos, revisión de resultados y ajustes de medicamentos desde casa, en cualquier parte de California." } }
        ] }
    ]
  },

  patients: {
    lede: { en: "Everything you need before your first visit: what to bring, what we accept, and how video visits work.", es: "Todo lo que necesita antes de su primera visita: qué traer, qué aceptamos y cómo funcionan las consultas por video." },
    bringTitle: { en: "What to bring to your first visit", es: "Qué traer a su primera visita" },
    bring: [
      { en: "Photo ID and insurance card", es: "Identificación con foto y tarjeta de seguro" },
      { en: "Referral from your doctor (required for most HMO plans)", es: "Referencia de su médico (requerida para la mayoría de planes HMO)" },
      { en: "Hospital discharge summary, if you were recently admitted", es: "Resumen de alta del hospital, si fue hospitalizado recientemente" },
      { en: "Recent lab results, cultures and imaging reports", es: "Resultados de laboratorio, cultivos e imágenes recientes" },
      { en: "A list of all medications, including antibiotics you've already taken", es: "Lista de todos sus medicamentos, incluidos antibióticos que ya tomó" },
      { en: "Photos of the wound or rash, if it has changed over time", es: "Fotos de la herida o el sarpullido, si ha cambiado con el tiempo" }
    ],
    teleTitle: { en: "Video visits", es: "Consultas por video" },
    tele: { en: "Choose a video visit when you book. You'll receive a secure link by text or email. Join from a phone, tablet or computer anywhere in California. Video works well for follow-ups, lab reviews and medication questions; new wound problems are usually best seen in person.", es: "Elija una consulta por video al reservar. Recibirá un enlace seguro por mensaje de texto o correo. Conéctese desde un teléfono, tableta o computadora en cualquier parte de California. El video funciona bien para seguimientos, revisión de laboratorios y dudas de medicamentos; los problemas nuevos de heridas suelen verse mejor en persona." },
    payTitle: { en: "Payment", es: "Pago" },
    pay: { en: "We accept major credit and debit cards, checks and cash. Self-pay patients receive a price before the visit. Please call about HSA or FSA cards.", es: "Aceptamos las principales tarjetas de crédito y débito, cheques y efectivo. Los pacientes que pagan directamente reciben el precio antes de la visita. Llame para consultar sobre tarjetas HSA o FSA." },
    formsTitle: { en: "Forms", es: "Formularios" },
    forms: [
      { id: "registration", en: "New patient registration", es: "Registro de paciente nuevo" },
      { id: "history", en: "Medical history questionnaire", es: "Cuestionario de historial médico" },
      { id: "release", en: "Authorization to release records", es: "Autorización para liberar expedientes" },
      { id: "privacy-notice", en: "Notice of privacy practices", es: "Aviso de prácticas de privacidad" }
    ],
    formsNote: { en: "Print them, fill them in at home and bring them, or complete them at the office. Please don't email medical information; the booking form on this site is the secure channel.", es: "Imprímalos, llénelos en casa y tráigalos, o complételos en el consultorio. Por favor no envíe información médica por correo electrónico; el formulario de reserva de este sitio es el canal seguro." },
    faqTitle: { en: "Common questions", es: "Preguntas frecuentes" },
    faq: [
      { q: { en: "Do I need a referral?", es: "¿Necesito una referencia?" }, a: { en: "If you have an HMO plan (for example through IEHP, Health Net or Blue Shield HMO), yes, your primary care doctor sends us a referral. Medicare, PPO and self-pay patients can book directly.", es: "Si tiene un plan HMO (por ejemplo IEHP, Health Net o Blue Shield HMO), sí: su médico de cabecera nos envía la referencia. Con Medicare, PPO o pago directo puede reservar directamente." } },
      { q: { en: "How soon can I be seen?", es: "¿Qué tan pronto me pueden atender?" }, a: { en: "Patients leaving the hospital are usually seen within a week. Routine new-patient visits are typically available within two to three weeks.", es: "Los pacientes que salen del hospital normalmente se atienden en una semana. Las visitas rutinarias de paciente nuevo suelen estar disponibles en dos o tres semanas." } },
      { q: { en: "Is HIV or STI care confidential?", es: "¿La atención de VIH o ITS es confidencial?" }, a: { en: "Yes. Testing and treatment are handled privately, and results are shared only with you and anyone you authorize.", es: "Sí. Las pruebas y el tratamiento se manejan de forma privada y los resultados se comparten solo con usted y con quien usted autorice." } },
      { q: { en: "Do you see patients from Barstow, Lucerne Valley or Hesperia?", es: "¿Atienden pacientes de Barstow, Lucerne Valley o Hesperia?" }, a: { en: "Yes. Many patients drive in from across the High Desert, and video visits can replace some of the follow-up trips.", es: "Sí. Muchos pacientes vienen de todo el High Desert, y las consultas por video pueden reemplazar algunos viajes de seguimiento." } },
      { q: { en: "What if I have an emergency after hours?", es: "¿Qué hago si tengo una emergencia fuera de horario?" }, a: { en: "Call 911 or go to the nearest emergency room. Dr. Ganesh is on the medical staff at St. Mary, Desert Valley and Victor Valley Global, and can be consulted there.", es: "Llame al 911 o vaya a la sala de emergencias más cercana. El Dr. Ganesh forma parte del personal médico de St. Mary, Desert Valley y Victor Valley Global, y puede ser consultado allí." } },
      { q: { en: "Where do I park?", es: "¿Dónde me estaciono?" }, a: { en: "Free parking is available on site in front of the building on Kamana Road, with step-free access from the lot to the entrance.", es: "Hay estacionamiento gratuito en el sitio, frente al edificio en Kamana Road, con acceso sin escalones desde el estacionamiento hasta la entrada." } }
    ]
  },

  contact: {
    lede: { en: "Call, fax a referral, or stop by. We're on Kamana Road in Apple Valley, a short drive from Providence St. Mary.", es: "Llame, envíe una referencia por fax o visítenos. Estamos en Kamana Road en Apple Valley, a poca distancia de Providence St. Mary." },
    phone: { en: "Phone", es: "Teléfono" }, fax: { en: "Fax (referrals)", es: "Fax (referencias)" }, email: { en: "Email (non-medical)", es: "Correo (no médico)" },
    parking: { en: "Free parking on site, at the door", es: "Estacionamiento gratuito en el sitio, junto a la entrada" },
    emergency: { en: "If this is an emergency, call 911.", es: "Si es una emergencia, llame al 911." }
  },

  book: {
    lede: { en: "Pick a visit type and a time. Our office confirms by phone or text within one business day.", es: "Elija el tipo de visita y una hora. El consultorio confirma por teléfono o mensaje de texto en un día hábil." },
    stepsLabel: [{ en: "Visit", es: "Visita" }, { en: "Time", es: "Hora" }, { en: "Details", es: "Datos" }, { en: "Confirm", es: "Confirmar" }],
    s1: { en: "What kind of visit do you need?", es: "¿Qué tipo de visita necesita?" },
    types: [
      { id: "new", dur: 45, h: { en: "New patient consultation", es: "Consulta de paciente nuevo" }, s: { en: "First visit for an infection or a second opinion", es: "Primera visita por una infección o segunda opinión" } },
      { id: "post", dur: 30, h: { en: "After a hospital stay", es: "Después del hospital" }, s: { en: "Post-discharge follow-up, priority scheduling", es: "Seguimiento posalta, con prioridad" } },
      { id: "follow", dur: 20, h: { en: "Follow-up visit", es: "Visita de seguimiento" }, s: { en: "Established patients", es: "Pacientes establecidos" } },
      { id: "video", dur: 20, h: { en: "Video visit", es: "Consulta por video" }, s: { en: "From home, anywhere in California", es: "Desde casa, en cualquier parte de California" } },
      { id: "wound", dur: 30, h: { en: "Wound check", es: "Revisión de herida" }, s: { en: "In-office wound care", es: "Curación de heridas en el consultorio" } },
      { id: "travel", dur: 30, h: { en: "Travel consultation", es: "Consulta de viaje" }, s: { en: "Vaccines and prescriptions before a trip", es: "Vacunas y recetas antes de un viaje" } }
    ],
    min: { en: "min", es: "min" },
    s2: { en: "Choose a day and time", es: "Elija día y hora" },
    pickDay: { en: "Pick a day to see available times.", es: "Elija un día para ver los horarios disponibles." },
    noSlots: { en: "No openings that day. Try another.", es: "No hay espacios ese día. Pruebe otro." },
    timesFor: { en: "Times for", es: "Horarios para" },
    s3: { en: "Your details", es: "Sus datos" },
    f: {
      first: { en: "First name", es: "Nombre" }, last: { en: "Last name", es: "Apellido" }, dob: { en: "Date of birth", es: "Fecha de nacimiento" },
      phone: { en: "Mobile phone", es: "Teléfono celular" }, email: { en: "Email", es: "Correo electrónico" },
      ins: { en: "Insurance", es: "Seguro" }, selfpay: { en: "Self-pay", es: "Pago directo" }, other: { en: "Other", es: "Otro" },
      status: { en: "Have you seen Dr. Ganesh before?", es: "¿Ha visto antes al Dr. Ganesh?" }, newp: { en: "No, I'm a new patient", es: "No, soy paciente nuevo" }, estp: { en: "Yes, I'm an established patient", es: "Sí, soy paciente establecido" },
      ref: { en: "Referred by (doctor or hospital, optional)", es: "Referido por (médico u hospital, opcional)" },
      reason: { en: "Reason for visit, in a few words", es: "Motivo de la visita, en pocas palabras" },
      reasonHint: { en: "Keep it brief. We'll collect your full history securely at the visit.", es: "Sea breve. Recogeremos su historial completo de forma segura en la visita." },
      consent: { en: "I understand this is an appointment request and the office will confirm it. This form is not for emergencies.", es: "Entiendo que esto es una solicitud de cita y que el consultorio la confirmará. Este formulario no es para emergencias." },
      req: { en: "Required", es: "Obligatorio" }, badPhone: { en: "Enter a 10-digit phone number", es: "Ingrese un número de 10 dígitos" }, badEmail: { en: "Enter a valid email", es: "Ingrese un correo válido" }
    },
    s4: { en: "Review and send", es: "Revisar y enviar" },
    reviewNote: { en: "Nothing is final yet. Our office will call or text to confirm this time, or offer the nearest alternative.", es: "Nada es definitivo todavía. El consultorio llamará o enviará un mensaje para confirmar esta hora u ofrecer la alternativa más cercana." },
    summaryTitle: { en: "Your request", es: "Su solicitud" },
    labels: { type: { en: "Visit", es: "Visita" }, when: { en: "When", es: "Cuándo" }, who: { en: "Patient", es: "Paciente" }, ins: { en: "Insurance", es: "Seguro" }, dur: { en: "Length", es: "Duración" }, where: { en: "Where", es: "Dónde" } },
    inOffice: { en: "Mojave Medical, Kamana Rd", es: "Mojave Medical, Kamana Rd" }, byVideo: { en: "Secure video link", es: "Enlace de video seguro" },
    notChosen: { en: "not chosen yet", es: "sin elegir" },
    back: { en: "Back", es: "Atrás" }, next: { en: "Continue", es: "Continuar" }, send: { en: "Request appointment", es: "Solicitar cita" },
    doneH: { en: "Request received", es: "Solicitud recibida" },
    doneP: { en: "We'll confirm by phone or text within one business day. If you don't hear from us, call the office.", es: "Confirmaremos por teléfono o mensaje de texto en un día hábil. Si no recibe noticias, llame al consultorio." },
    refNo: { en: "Reference", es: "Referencia" },
    another: { en: "Request another", es: "Solicitar otra" },
    offline: { en: "This preview has no server connected, so the request was saved in this browser only. On the live site it is delivered to the front desk.", es: "Esta vista previa no tiene servidor conectado, así que la solicitud se guardó solo en este navegador. En el sitio real se envía a la recepción." },
    sideH: { en: "Prefer to call?", es: "¿Prefiere llamar?" },
    sideP: { en: "Our front desk answers during office hours and returns voicemails the same day.", es: "La recepción contesta en horario de oficina y devuelve los mensajes de voz el mismo día." },
    sideRef: { en: "Recently discharged from a hospital? Choose “After a hospital stay” for priority scheduling.", es: "¿Recién dado de alta del hospital? Elija «Después del hospital» para programación prioritaria." },
    hipaa: { en: "This form is transmitted securely. Please don't include detailed medical information here.", es: "Este formulario se transmite de forma segura. Por favor no incluya información médica detallada aquí." }
  },

  footer: {
    tag: { en: "The independent infectious disease and internal medicine practice of Kevin N. Ganesh, MD, in Apple Valley, California.", es: "La consulta independiente de enfermedades infecciosas y medicina interna del Dr. Kevin N. Ganesh en Apple Valley, California." },
    pages: { en: "Pages", es: "Páginas" }, patientsCol: { en: "Patients", es: "Pacientes" }, contactCol: { en: "Contact", es: "Contacto" },
    links: [
      { href: "#/book", en: "Book an appointment", es: "Reservar cita" },
      { href: "#/patients", en: "Insurance & forms", es: "Seguros y formularios" },
      { href: "#/services", en: "Video visits", es: "Consultas por video" },
      { href: "#/contact", en: "Referring physicians", es: "Médicos que refieren" }
    ],
    legal: { en: "© 2026 Mojave Medical · Kevin N. Ganesh, MD · Apple Valley, California", es: "© 2026 Mojave Medical · Kevin N. Ganesh, MD · Apple Valley, California" },
    privacy: { en: "Privacy", es: "Privacidad" }, access: { en: "Accessibility", es: "Accesibilidad" }, formsLink: { en: "Patient forms", es: "Formularios" },
    google: { en: "Find us on Google", es: "Encuéntrenos en Google" }
  },

  legal: {
    privacy: {
      lede: { en: "What this website collects, why, and who can see it.", es: "Qué recopila este sitio web, por qué y quién puede verlo." },
      sections: [
        { h: { en: "What we collect", es: "Qué recopilamos" }, p: { en: "When you request an appointment we ask for your name, date of birth, phone number, an optional email address, your insurance carrier, whether you have seen Dr. Ganesh before, who referred you, and a short reason for the visit. That is all. Browsing the rest of the site collects nothing about you.", es: "Cuando solicita una cita le pedimos su nombre, fecha de nacimiento, teléfono, un correo electrónico opcional, su aseguradora, si ya ha visto al Dr. Ganesh, quién lo refirió y un motivo breve de la visita. Eso es todo. Navegar el resto del sitio no recopila nada sobre usted." } },
        { h: { en: "How it is stored", es: "Cómo se guarda" }, p: { en: "Your request travels over an encrypted connection and is stored on a server controlled by the practice, not by a third-party form service. Only front-desk staff and Dr. Ganesh can view it, after signing in. Every view and change is logged.", es: "Su solicitud viaja por una conexión cifrada y se guarda en un servidor controlado por el consultorio, no por un servicio de formularios externo. Solo el personal de recepción y el Dr. Ganesh pueden verla, después de iniciar sesión. Cada consulta y cambio queda registrado." } },
        { h: { en: "Email and text messages", es: "Correo y mensajes de texto" }, p: { en: "Staff are notified of a new request by an email that contains only a reference number. Your details are never sent by email. If you give us an email address we send you a short acknowledgement with your reference number and nothing else.", es: "El personal recibe un correo con solo un número de referencia. Sus datos nunca se envían por correo. Si nos da un correo electrónico, le enviamos un breve acuse de recibo con su número de referencia y nada más." } },
        { h: { en: "Cookies and tracking", es: "Cookies y rastreo" }, p: { en: "This site uses no advertising trackers, no social-media pixels, and no third-party analytics on the appointment form. Your browser may remember your language choice and, if the connection to our server is interrupted, hold an unsent request locally until it can be delivered.", es: "Este sitio no usa rastreadores publicitarios, píxeles de redes sociales ni analítica de terceros en el formulario de citas. Su navegador puede recordar su idioma y, si se interrumpe la conexión con nuestro servidor, guardar localmente una solicitud no enviada hasta poder entregarla." } },
        { h: { en: "How long we keep it", es: "Cuánto tiempo lo conservamos" }, p: { en: "Appointment requests are kept only as long as needed to schedule and confirm your visit, after which they are removed from the website system. Your medical record itself is kept in the practice's clinical system under the practice's Notice of Privacy Practices.", es: "Las solicitudes de cita se conservan solo el tiempo necesario para programar y confirmar su visita, y luego se eliminan del sistema del sitio web. Su expediente médico se conserva en el sistema clínico del consultorio conforme al Aviso de Prácticas de Privacidad." } },
        { h: { en: "Your rights", es: "Sus derechos" }, p: { en: "You can ask what we hold about you, ask us to correct it, or ask us to delete a request you no longer want scheduled. Call the office or write to the address below. The practice's full HIPAA Notice of Privacy Practices, covering your medical record, is available at the front desk and on our forms page.", es: "Puede preguntar qué información tenemos sobre usted, pedir que la corrijamos o que eliminemos una solicitud que ya no desea programar. Llame al consultorio o escríbanos a la dirección de abajo. El Aviso de Prácticas de Privacidad completo (HIPAA), que cubre su expediente médico, está disponible en recepción y en nuestra página de formularios." } }
      ],
      updated: { en: "Effective September 2026", es: "Vigente desde septiembre de 2026" }
    },
    accessibility: {
      lede: { en: "Everyone should be able to read this site and book a visit, whatever device or assistive technology they use.", es: "Todas las personas deben poder leer este sitio y reservar una visita, sin importar el dispositivo o la tecnología de apoyo que usen." },
      sections: [
        { h: { en: "Our standard", es: "Nuestro estándar" }, p: { en: "This website is built to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA. Text and controls meet the contrast ratios in that standard in both light and dark themes.", es: "Este sitio web está construido para cumplir las Pautas de Accesibilidad para el Contenido Web (WCAG) 2.2 en el nivel AA. El texto y los controles cumplen las relaciones de contraste de esa norma en los temas claro y oscuro." } },
        { h: { en: "What that means in practice", es: "Qué significa en la práctica" }, list: [
          { en: "Every page and the whole booking flow work with a keyboard alone. A visible focus outline shows where you are.", es: "Todas las páginas y todo el proceso de reserva funcionan solo con el teclado. Un contorno visible muestra dónde está." },
          { en: "Headings, landmarks, labels and button names are exposed to screen readers.", es: "Los encabezados, regiones, etiquetas y nombres de botones están disponibles para lectores de pantalla." },
          { en: "Text can be enlarged to 200% without loss of content. Nothing depends on colour alone.", es: "El texto se puede ampliar al 200% sin perder contenido. Nada depende solo del color." },
          { en: "Animation is turned off automatically when your device asks for reduced motion.", es: "La animación se desactiva automáticamente cuando su dispositivo solicita movimiento reducido." },
          { en: "The site is available in English and Spanish, and the calendar and forms follow the language you choose.", es: "El sitio está disponible en inglés y español, y el calendario y los formularios siguen el idioma que elija." }
        ] },
        { h: { en: "In the office", es: "En el consultorio" }, p: { en: "The clinic entrance on Kamana Road is at ground level with step-free access from the parking lot. If you need an accommodation for your visit, such as extra time, a large-print form, or help completing paperwork, call ahead and we will arrange it.", es: "La entrada de la clínica en Kamana Road está a nivel del suelo con acceso sin escalones desde el estacionamiento. Si necesita una adaptación para su visita, como más tiempo, un formulario en letra grande o ayuda para llenar documentos, llame con anticipación y lo organizaremos." } },
        { h: { en: "Tell us if something is hard to use", es: "Díganos si algo es difícil de usar" }, p: { en: "If any part of this site is difficult to use, we want to know. Call the office or email us, tell us what you were trying to do and what got in the way, and we will fix it and help you complete the task another way in the meantime.", es: "Si alguna parte de este sitio es difícil de usar, queremos saberlo. Llame al consultorio o escríbanos, cuéntenos qué intentaba hacer y qué se lo impidió, y lo corregiremos mientras le ayudamos a completar la tarea de otra manera." } }
      ]
    }
  },

  forms: {
    lede: { en: "Print these, fill them in at home, and bring them to your first visit. Or complete them at the office; we are happy to help.", es: "Imprímalos, llénelos en casa y tráigalos a su primera visita. O complételos en el consultorio; con gusto le ayudamos." },
    print: { en: "Print or save as PDF", es: "Imprimir o guardar como PDF" },
    back: { en: "All forms", es: "Todos los formularios" },
    sig: { en: "Signature", es: "Firma" }, date: { en: "Date", es: "Fecha" },
    officeUse: { en: "For office use", es: "Uso del consultorio" },
    items: [
      { id: "registration", title: { en: "New Patient Registration", es: "Registro de paciente nuevo" }, desc: { en: "Contact, insurance and emergency information.", es: "Datos de contacto, seguro y emergencia." },
        sections: [
          { h: { en: "Patient", es: "Paciente" }, fields: [
            { l: { en: "Last name", es: "Apellido" }, w: 4 }, { l: { en: "First name", es: "Nombre" }, w: 4 }, { l: { en: "Middle", es: "Segundo nombre" }, w: 2 }, { l: { en: "Date of birth", es: "Fecha de nacimiento" }, w: 2 },
            { l: { en: "Street address", es: "Dirección" }, w: 6 }, { l: { en: "City", es: "Ciudad" }, w: 3 }, { l: { en: "State", es: "Estado" }, w: 1 }, { l: { en: "ZIP", es: "Código postal" }, w: 2 },
            { l: { en: "Mobile phone", es: "Teléfono celular" }, w: 3 }, { l: { en: "Home phone", es: "Teléfono de casa" }, w: 3 }, { l: { en: "Email", es: "Correo electrónico" }, w: 6 },
            { l: { en: "Preferred language", es: "Idioma preferido" }, w: 3 }, { l: { en: "OK to leave voicemail?  Yes / No", es: "¿Podemos dejar mensaje de voz?  Sí / No" }, w: 4 }, { l: { en: "OK to text?  Yes / No", es: "¿Podemos enviar mensajes de texto?  Sí / No" }, w: 5 }
          ] },
          { h: { en: "Insurance", es: "Seguro" }, fields: [
            { l: { en: "Primary insurance", es: "Seguro principal" }, w: 5 }, { l: { en: "Member ID", es: "Número de miembro" }, w: 4 }, { l: { en: "Group number", es: "Número de grupo" }, w: 3 },
            { l: { en: "Policy holder name", es: "Nombre del titular" }, w: 5 }, { l: { en: "Policy holder date of birth", es: "Fecha de nacimiento del titular" }, w: 4 }, { l: { en: "Relationship to patient", es: "Relación con el paciente" }, w: 3 },
            { l: { en: "Secondary insurance", es: "Seguro secundario" }, w: 5 }, { l: { en: "Member ID", es: "Número de miembro" }, w: 4 }, { l: { en: "Group number", es: "Número de grupo" }, w: 3 }
          ] },
          { h: { en: "Referring and primary care physicians", es: "Médicos que refieren y de cabecera" }, fields: [
            { l: { en: "Referred by (doctor or hospital)", es: "Referido por (médico u hospital)" }, w: 6 }, { l: { en: "Their phone or fax", es: "Su teléfono o fax" }, w: 6 },
            { l: { en: "Primary care physician", es: "Médico de cabecera" }, w: 6 }, { l: { en: "Pharmacy name and location", es: "Farmacia y ubicación" }, w: 6 }
          ] },
          { h: { en: "Emergency contact", es: "Contacto de emergencia" }, fields: [
            { l: { en: "Name", es: "Nombre" }, w: 5 }, { l: { en: "Relationship", es: "Relación" }, w: 3 }, { l: { en: "Phone", es: "Teléfono" }, w: 4 }
          ] }
        ],
        consent: { en: "I certify that the information above is correct. I authorize Mojave Medical to release medical information needed to process insurance claims and to bill my insurance directly. I understand I am responsible for charges not covered by my insurance.", es: "Certifico que la información anterior es correcta. Autorizo a Mojave Medical a divulgar la información médica necesaria para procesar reclamaciones de seguro y a facturar directamente a mi aseguradora. Entiendo que soy responsable de los cargos no cubiertos por mi seguro." }
      },
      { id: "history", title: { en: "Medical History Questionnaire", es: "Cuestionario de historial médico" }, desc: { en: "Your conditions, medications, allergies and recent infections.", es: "Sus condiciones, medicamentos, alergias e infecciones recientes." },
        sections: [
          { h: { en: "Reason for today's visit", es: "Motivo de la visita de hoy" }, lines: 3 },
          { h: { en: "Current medications, including antibiotics you are taking or recently finished (name, dose, how often)", es: "Medicamentos actuales, incluidos antibióticos que toma o terminó recientemente (nombre, dosis, frecuencia)" }, lines: 6 },
          { h: { en: "Allergies to medications, and what happened", es: "Alergias a medicamentos y qué ocurrió" }, lines: 3 },
          { h: { en: "Recent hospital stays or surgeries (where, when, why)", es: "Hospitalizaciones o cirugías recientes (dónde, cuándo, por qué)" }, lines: 3 },
          { h: { en: "Check any that apply", es: "Marque las que correspondan" }, checks: [
            { en: "Diabetes", es: "Diabetes" }, { en: "High blood pressure", es: "Presión alta" }, { en: "Heart disease", es: "Enfermedad del corazón" }, { en: "Kidney disease or dialysis", es: "Enfermedad renal o diálisis" },
            { en: "Liver disease or hepatitis", es: "Enfermedad del hígado o hepatitis" }, { en: "HIV", es: "VIH" }, { en: "Cancer or chemotherapy", es: "Cáncer o quimioterapia" }, { en: "Transplant or immune-suppressing medicine", es: "Trasplante o medicamentos inmunosupresores" },
            { en: "Artificial joint, heart valve or implanted device", es: "Prótesis articular, válvula cardíaca o dispositivo implantado" }, { en: "Wound that will not heal", es: "Herida que no sana" }, { en: "Tuberculosis or positive TB test", es: "Tuberculosis o prueba de TB positiva" }, { en: "Recent travel outside the US", es: "Viaje reciente fuera de EE. UU." },
            { en: "Tobacco use", es: "Uso de tabaco" }, { en: "Alcohol use", es: "Consumo de alcohol" }, { en: "Pregnant or possibly pregnant", es: "Embarazada o posiblemente embarazada" }, { en: "Animal or insect bite in the last 3 months", es: "Mordedura de animal o insecto en los últimos 3 meses" }
          ] },
          { h: { en: "Vaccines received in the last 5 years (flu, COVID-19, pneumonia, shingles, hepatitis, tetanus, others)", es: "Vacunas recibidas en los últimos 5 años (influenza, COVID-19, neumonía, herpes zóster, hepatitis, tétanos, otras)" }, lines: 2 },
          { h: { en: "Family history of note", es: "Antecedentes familiares relevantes" }, lines: 2 }
        ],
        consent: { en: "The information above is accurate to the best of my knowledge.", es: "La información anterior es correcta según mi leal saber y entender." }
      },
      { id: "release", title: { en: "Authorization to Release Medical Records", es: "Autorización para divulgar expedientes médicos" }, desc: { en: "Lets us obtain records from a hospital or another doctor, or send yours elsewhere.", es: "Nos permite obtener expedientes de un hospital u otro médico, o enviar los suyos a otro lugar." },
        sections: [
          { h: { en: "Patient", es: "Paciente" }, fields: [ { l: { en: "Full name", es: "Nombre completo" }, w: 6 }, { l: { en: "Date of birth", es: "Fecha de nacimiento" }, w: 3 }, { l: { en: "Phone", es: "Teléfono" }, w: 3 } ] },
          { h: { en: "Release records FROM", es: "Divulgar expedientes DE" }, fields: [ { l: { en: "Facility or physician", es: "Institución o médico" }, w: 6 }, { l: { en: "Address / fax", es: "Dirección / fax" }, w: 6 } ] },
          { h: { en: "Release records TO", es: "Divulgar expedientes A" }, fields: [ { l: { en: "Facility or physician", es: "Institución o médico" }, w: 6 }, { l: { en: "Address / fax", es: "Dirección / fax" }, w: 6 } ] },
          { h: { en: "Records to release (check)", es: "Expedientes a divulgar (marque)" }, checks: [
            { en: "Discharge summary", es: "Resumen de alta" }, { en: "Laboratory results and cultures", es: "Resultados de laboratorio y cultivos" }, { en: "Imaging reports", es: "Informes de imágenes" }, { en: "Operative reports", es: "Informes quirúrgicos" },
            { en: "Medication list", es: "Lista de medicamentos" }, { en: "Progress notes", es: "Notas de evolución" }, { en: "Entire record for dates:", es: "Expediente completo para las fechas:" }, { en: "Other:", es: "Otro:" }
          ] },
          { h: { en: "Purpose", es: "Propósito" }, fields: [ { l: { en: "Continuing care / at my request / other", es: "Continuidad de atención / a mi solicitud / otro" }, w: 12 } ] }
        ],
        consent: { en: "I authorize the release of the records described above. This authorization expires one year from the date signed unless I write a different date here: ________. I may revoke it in writing at any time, except where action has already been taken. Records may include information about mental health, substance use, HIV or genetic testing only if I initial here: ______. Information disclosed under this authorization may be re-disclosed by the recipient and may no longer be protected by federal privacy rules.", es: "Autorizo la divulgación de los expedientes descritos arriba. Esta autorización vence un año después de la fecha de firma salvo que escriba otra fecha aquí: ________. Puedo revocarla por escrito en cualquier momento, salvo cuando ya se haya actuado con base en ella. Los expedientes pueden incluir información sobre salud mental, uso de sustancias, VIH o pruebas genéticas solo si pongo mis iniciales aquí: ______. La información divulgada bajo esta autorización puede ser divulgada de nuevo por el destinatario y dejar de estar protegida por las normas federales de privacidad." }
      },
      { id: "privacy-notice", title: { en: "Notice of Privacy Practices", es: "Aviso de prácticas de privacidad" }, desc: { en: "How your medical information may be used and disclosed, and your rights under HIPAA.", es: "Cómo puede usarse y divulgarse su información médica, y sus derechos bajo HIPAA." },
        text: [
          { h: { en: "This notice describes how medical information about you may be used and disclosed and how you can get access to this information. Please review it carefully.", es: "Este aviso describe cómo puede usarse y divulgarse su información médica y cómo puede obtener acceso a ella. Léalo con atención." } },
          { h: { en: "How we may use and disclose your health information", es: "Cómo podemos usar y divulgar su información de salud" }, p: { en: "For treatment: to provide, coordinate and manage your care, including sharing with hospitals, laboratories, pharmacies and other physicians involved in your care. For payment: to bill and collect payment from you, your insurer or another payer. For health care operations: for quality review, training, licensing and the day-to-day running of the practice. We may also contact you to remind you of appointments, to tell you about treatment options, and, in an emergency, to notify a family member or someone responsible for your care.", es: "Para tratamiento: para brindar, coordinar y administrar su atención, incluido compartir información con hospitales, laboratorios, farmacias y otros médicos involucrados. Para pago: para facturar y cobrar a usted, a su aseguradora u otro pagador. Para operaciones de atención médica: para revisión de calidad, capacitación, licencias y el funcionamiento diario del consultorio. También podemos contactarlo para recordarle citas, informarle sobre opciones de tratamiento y, en una emergencia, avisar a un familiar o a la persona responsable de su atención." } },
          { h: { en: "Uses and disclosures required or permitted by law", es: "Usos y divulgaciones exigidos o permitidos por la ley" }, p: { en: "We may disclose information without your authorization when required by law: to public health authorities for disease reporting, including reportable infectious diseases; to health oversight agencies; in response to court orders; to prevent a serious threat to health or safety; to coroners and medical examiners; for workers' compensation; and to law enforcement in limited circumstances. Any other use or disclosure, including most uses of psychotherapy notes, marketing, and sale of information, requires your written authorization, which you may revoke at any time in writing.", es: "Podemos divulgar información sin su autorización cuando la ley lo exige: a autoridades de salud pública para notificación de enfermedades, incluidas las enfermedades infecciosas de declaración obligatoria; a agencias de supervisión sanitaria; en respuesta a órdenes judiciales; para prevenir una amenaza grave a la salud o la seguridad; a médicos forenses; para compensación laboral; y a las fuerzas del orden en circunstancias limitadas. Cualquier otro uso o divulgación, incluida la mayoría de usos de notas de psicoterapia, mercadeo y venta de información, requiere su autorización por escrito, que puede revocar en cualquier momento por escrito." } },
          { h: { en: "Your rights", es: "Sus derechos" }, list: [
            { en: "To inspect and receive a copy of your medical record, usually within 30 days, in paper or electronic form. A reasonable copying fee may apply.", es: "A revisar y recibir una copia de su expediente médico, normalmente en 30 días, en papel o formato electrónico. Puede aplicarse una tarifa razonable de copiado." },
            { en: "To request a correction of information you believe is wrong or incomplete.", es: "A solicitar la corrección de información que considere errónea o incompleta." },
            { en: "To request restrictions on how we use or disclose your information. We are not required to agree, except that we must honour a request not to tell your health plan about a service you paid for in full out of pocket.", es: "A solicitar restricciones sobre cómo usamos o divulgamos su información. No estamos obligados a aceptar, salvo que debemos respetar la solicitud de no informar a su plan de salud sobre un servicio que pagó íntegramente de su bolsillo." },
            { en: "To ask that we contact you in a particular way or at a particular place, for example only by mobile phone.", es: "A pedir que lo contactemos de una manera o en un lugar específico, por ejemplo solo por celular." },
            { en: "To receive an accounting of certain disclosures we have made of your information in the previous six years.", es: "A recibir un informe de ciertas divulgaciones de su información realizadas en los últimos seis años." },
            { en: "To be notified if a breach of your unsecured health information occurs.", es: "A ser notificado si ocurre una violación de su información de salud no protegida." },
            { en: "To receive a paper copy of this notice at any time.", es: "A recibir una copia impresa de este aviso en cualquier momento." }
          ] },
          { h: { en: "Our duties", es: "Nuestras obligaciones" }, p: { en: "We are required by law to keep your health information private, to give you this notice, and to follow the notice currently in effect. We reserve the right to change this notice; the new notice will apply to all information we hold and will be posted in the office and on our website.", es: "La ley nos obliga a mantener la privacidad de su información de salud, a entregarle este aviso y a cumplir el aviso vigente. Nos reservamos el derecho de modificarlo; el nuevo aviso se aplicará a toda la información que tengamos y se publicará en el consultorio y en nuestro sitio web." } },
          { h: { en: "Questions and complaints", es: "Preguntas y quejas" }, p: { en: "If you believe your privacy rights have been violated, you may file a complaint with the practice's privacy officer at the address below, or with the Secretary of the U.S. Department of Health and Human Services, Office for Civil Rights. We will not retaliate against you for filing a complaint. Privacy officer: Mojave Medical, 16041 Kamana Rd, Apple Valley, CA 92307, (760) 688-0084.", es: "Si cree que se han violado sus derechos de privacidad, puede presentar una queja ante el oficial de privacidad del consultorio en la dirección indicada abajo, o ante el Secretario del Departamento de Salud y Servicios Humanos de EE. UU., Oficina de Derechos Civiles. No tomaremos represalias por presentar una queja. Oficial de privacidad: Mojave Medical, 16041 Kamana Rd, Apple Valley, CA 92307, (760) 688-0084." } }
        ],
        ack: { en: "Acknowledgement: I have received a copy of the Notice of Privacy Practices of Mojave Medical.", es: "Acuse de recibo: he recibido una copia del Aviso de Prácticas de Privacidad de Mojave Medical." }
      }
    ]
  }
};
</script>

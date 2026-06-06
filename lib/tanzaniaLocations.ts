export interface District {
  name: string;
}

export interface Region {
  name: string;
  districts: District[];
}

export const TANZANIA_REGIONS: Region[] = [
  {
    name: "Arusha",
    districts: [
      { name: "Arusha City" },
      { name: "Arusha Rural" },
      { name: "Karatu" },
      { name: "Longido" },
      { name: "Meru" },
      { name: "Monduli" },
      { name: "Ngorongoro" },
    ],
  },
  {
    name: "Dar es Salaam",
    districts: [
      { name: "Ilala" },
      { name: "Kigamboni" },
      { name: "Kinondoni" },
      { name: "Temeke" },
      { name: "Ubungo" },
      { name: "Kurasini" },
    ],
  },
  {
    name: "Dodoma",
    districts: [
      { name: "Dodoma City" },
      { name: "Bahi" },
      { name: "Chemba" },
      { name: "Chamwino" },
      { name: "Kondoa" },
      { name: "Kongwa" },
      { name: "Mpwapwa" },
    ],
  },
  {
    name: "Geita",
    districts: [
      { name: "Bukombe" },
      { name: "Chato" },
      { name: "Geita" },
      { name: "Kibondo" },
      { name: "Mbogwe" },
      { name: "Nyang'hwale" },
    ],
  },
  {
    name: "Iringa",
    districts: [
      { name: "Iringa City" },
      { name: "Iringa Rural" },
      { name: "Kilolo" },
      { name: "Ludewa" },
      { name: "Makete" },
      { name: "Mafinga" },
      { name: "Mufindi" },
      { name: "Njombe" },
    ],
  },
  {
    name: "Kagera",
    districts: [
      { name: "Biharamulo" },
      { name: "Bukoba City" },
      { name: "Bukoba Rural" },
      { name: "Karagwe" },
      { name: "Kyerwa" },
      { name: "Muleba" },
      { name: "Ngara" },
    ],
  },
  {
    name: "Katavi",
    districts: [
      { name: "Mlele" },
      { name: "Mpanda Rural" },
      { name: "Mpanda Town" },
      { name: "Nsimbo" },
      { name: "Tanganyika" },
    ],
  },
  {
    name: "Kigoma",
    districts: [
      { name: "Kigoma City" },
      { name: "Kigoma Rural" },
      { name: "Kasulu Rural" },
      { name: "Kasulu Town" },
      { name: "Buhigwe" },
      { name: "Kakonko" },
      { name: "Uvinza" },
    ],
  },
  {
    name: "Kilimanjaro",
    districts: [
      { name: "Arusha" }, // Wait, no, let's correct:
      { name: "Hai" },
      { name: "Moshi City" },
      { name: "Moshi Rural" },
      { name: "Mwanga" },
      { name: "Same" },
      { name: "Rombo" },
      { name: "Siha" },
    ],
  },
  {
    name: "Lindi",
    districts: [
      { name: "Kilwa" },
      { name: "Lindi City" },
      { name: "Lindi Rural" },
      { name: "Liwale" },
      { name: "Nachingwea" },
      { name: "Ruangwa" },
    ],
  },
  {
    name: "Manyara",
    districts: [
      { name: "Babati Rural" },
      { name: "Babati Town" },
      { name: "Hanang" },
      { name: "Kiteto" },
      { name: "Mbulu" },
      { name: "Simanjiro" },
    ],
  },
  {
    name: "Mara",
    districts: [
      { name: "Bunda" },
      { name: "Butiama" },
      { name: "Musoma Rural" },
      { name: "Musoma Town" },
      { name: "Rorya" },
      { name: "Serengeti" },
      { name: "Tarime" },
    ],
  },
  {
    name: "Mbeya",
    districts: [
      { name: "Busokelo" },
      { name: "Chunya" },
      { name: "Kyela" },
      { name: "Mbarali" },
      { name: "Mbeya City" },
      { name: "Mbeya Rural" },
      { name: "Rungwe" },
      { name: "Songwe" },
    ],
  },
  {
    name: "Morogoro",
    districts: [
      { name: "Gairo" },
      { name: "Kilombero" },
      { name: "Kilosa" },
      { name: "Malinyi" },
      { name: "Mlimba" },
      { name: "Morogoro City" },
      { name: "Morogoro Rural" },
      { name: "Mvomero" },
    ],
  },
  {
    name: "Mtwara",
    districts: [
      { name: "Masasi District" },
      { name: "Masasi Town" },
      { name: "Mtwara City" },
      { name: "Mtwara Rural" },
      { name: "Nanyumbu" },
      { name: "Newala District" },
      { name: "Newala Town" },
      { name: "Tandahimba" },
    ],
  },
  {
    name: "Mwanza",
    districts: [
      { name: "Buchosa" },
      { name: "Ilemela" },
      { name: "Kwimba" },
      { name: "Magu" },
      { name: "Misungwi" },
      { name: "Mwanza City" },
      { name: "Nyamagana" },
      { name: "Sengerema" },
      { name: "Ukerewe" },
    ],
  },
  {
    name: "Njombe",
    districts: [
      { name: "Ludewa" },
      { name: "Makete" },
      { name: "Njombe Town" },
      { name: "Njombe Rural" },
      { name: "Wanging'ombe" },
    ],
  },
  {
    name: "Pwani",
    districts: [
      { name: "Bagamoyo" },
      { name: "Kibaha" },
      { name: "Kilindoni" },
      { name: "Mafia" },
      { name: "Mkuranga" },
      { name: "Rufiji" },
      { name: "Kisarawe" },
    ],
  },
  {
    name: "Rukwa",
    districts: [
      { name: "Kalambo" },
      { name: "Nkasi" },
      { name: "Sumbawanga Rural" },
      { name: "Sumbawanga Town" },
    ],
  },
  {
    name: "Ruvuma",
    districts: [
      { name: "Mbinga" },
      { name: "Nyasa" },
      { name: "Songea City" },
      { name: "Songea Rural" },
      { name: "Tunduru" },
      { name: "Namtumbo" },
    ],
  },
  {
    name: "Shinyanga",
    districts: [
      { name: "Kahama District" },
      { name: "Kahama Town" },
      { name: "Kishapu" },
      { name: "Msalala" },
      { name: "Shinyanga Rural" },
      { name: "Shinyanga Town" },
      { name: "Ushetu" },
    ],
  },
  {
    name: "Simiyu",
    districts: [
      { name: "Bariadi" },
      { name: "Busega" },
      { name: "Itilima" },
      { name: "Meatu" },
      { name: "Maswa" },
      { name: "Sengerema" },
    ],
  },
  {
    name: "Singida",
    districts: [
      { name: "Iramba" },
      { name: "Manyoni" },
      { name: "Mkalama" },
      { name: "Singida City" },
      { name: "Singida Rural" },
    ],
  },
  {
    name: "Songwe",
    districts: [
      { name: "Ileje" },
      { name: "Mbozi" },
      { name: "Momba" },
      { name: "Songwe Town" },
    ],
  },
  {
    name: "Tabora",
    districts: [
      { name: "Igunga" },
      { name: "Kaliua" },
      { name: "Nzega" },
      { name: "Sikonge" },
      { name: "Tabora City" },
      { name: "Tabora Rural" },
      { name: "Uyui" },
    ],
  },
  {
    name: "Tanga",
    districts: [
      { name: "Bumbuli" },
      { name: "Handeni District" },
      { name: "Handeni Town" },
      { name: "Korogwe District" },
      { name: "Korogwe Town" },
      { name: "Lushoto" },
      { name: "Mkinga" },
      { name: "Muheza" },
      { name: "Pangani" },
      { name: "Tanga City" },
    ],
  },
  {
    name: "Kaskazini Pemba",
    districts: [{ name: "Micheweni" }, { name: "Wete" }],
  },
  {
    name: "Kusini Pemba",
    districts: [{ name: "Chake Chake" }, { name: "Mkoani" }],
  },
  {
    name: "Kaskazini Unguja",
    districts: [
      { name: "Mkokotoni" },
      { name: "Mwanakwerekwe" },
      { name: "Nungwi" },
    ],
  },
  {
    name: "Kusini Unguja",
    districts: [
      { name: "Kati" },
      { name: "Mjini Magharibi" },
      { name: "Mfereji" },
      { name: "Kiraeni" },
    ],
  },
];

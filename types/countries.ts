export type CountryCode =
  | "af"
  | "al"
  | "dz"
  | "ad"
  | "ao"
  | "ag"
  | "ar"
  | "am"
  | "au"
  | "at"
  | "az"
  | "bs"
  | "bh"
  | "bd"
  | "bb"
  | "by"
  | "be"
  | "bz"
  | "bj"
  | "bt"
  | "bo"
  | "ba"
  | "bw"
  | "br"
  | "bn"
  | "bg"
  | "bf"
  | "bi"
  | "cv"
  | "kh"
  | "cm"
  | "ca"
  | "cf"
  | "td"
  | "cl"
  | "cn"
  | "co"
  | "km"
  | "cg"
  | "cd"
  | "cr"
  | "ci"
  | "hr"
  | "cu"
  | "cy"
  | "cz"
  | "dk"
  | "dj"
  | "dm"
  | "do"
  | "ec"
  | "eg"
  | "sv"
  | "gq"
  | "er"
  | "ee"
  | "sz"
  | "et"
  | "fj"
  | "fi"
  | "fr"
  | "ga"
  | "gm"
  | "ge"
  | "de"
  | "gh"
  | "gr"
  | "gd"
  | "gt"
  | "gn"
  | "gw"
  | "gy"
  | "ht"
  | "va"
  | "hn"
  | "hu"
  | "is"
  | "in"
  | "id"
  | "ir"
  | "iq"
  | "ie"
  // | "il"
  | "it"
  | "jm"
  | "jp"
  | "jo"
  | "kz"
  | "ke"
  | "ki"
  | "kp"
  | "kr"
  | "kw"
  | "kg"
  | "la"
  | "lv"
  | "lb"
  | "ls"
  | "lr"
  | "ly"
  | "li"
  | "lt"
  | "lu"
  | "mg"
  | "mw"
  | "my"
  | "mv"
  | "ml"
  | "mt"
  | "mh"
  | "mr"
  | "mu"
  | "mx"
  | "fm"
  | "md"
  | "mc"
  | "mn"
  | "me"
  | "ma"
  | "mz"
  | "mm"
  | "na"
  | "nr"
  | "np"
  | "nl"
  | "nz"
  | "ni"
  | "ne"
  | "ng"
  | "mk"
  | "no"
  | "om"
  | "pk"
  | "pw"
  | "ps"
  | "pa"
  | "pg"
  | "py"
  | "pe"
  | "ph"
  | "pl"
  | "pt"
  | "qa"
  | "ro"
  | "ru"
  | "rw"
  | "kn"
  | "lc"
  | "vc"
  | "ws"
  | "sm"
  | "st"
  | "sa"
  | "sn"
  | "rs"
  | "sc"
  | "sl"
  | "sg"
  | "sk"
  | "si"
  | "sb"
  | "so"
  | "za"
  | "ss"
  | "es"
  | "lk"
  | "sd"
  | "sr"
  | "se"
  | "ch"
  | "sy"
  | "tj"
  | "tz"
  | "th"
  | "tl"
  | "tg"
  | "to"
  | "tt"
  | "tn"
  | "tr"
  | "tm"
  | "tv"
  | "ug"
  | "ua"
  | "ae"
  | "gb"
  | "us"
  | "uy"
  | "uz"
  | "vu"
  | "ve"
  | "vn"
  | "ye"
  | "zm"
  | "zw";

export type Country = {
  id: number;
  alpha2: CountryCode;
  alpha3: string;
  name: string;
};

export const COUNTRIES: Country[] = [
  { id: 4, alpha2: "af", alpha3: "afg", name: "Afghanistan" },
  { id: 8, alpha2: "al", alpha3: "alb", name: "Albania" },
  { id: 12, alpha2: "dz", alpha3: "dza", name: "Algeria" },
  { id: 20, alpha2: "ad", alpha3: "and", name: "Andorra" },
  { id: 24, alpha2: "ao", alpha3: "ago", name: "Angola" },
  { id: 28, alpha2: "ag", alpha3: "atg", name: "Antigua and Barbuda" },
  { id: 32, alpha2: "ar", alpha3: "arg", name: "Argentina" },
  { id: 51, alpha2: "am", alpha3: "arm", name: "Armenia" },
  { id: 36, alpha2: "au", alpha3: "aus", name: "Australia" },
  { id: 40, alpha2: "at", alpha3: "aut", name: "Austria" },
  { id: 31, alpha2: "az", alpha3: "aze", name: "Azerbaijan" },
  { id: 44, alpha2: "bs", alpha3: "bhs", name: "Bahamas" },
  { id: 48, alpha2: "bh", alpha3: "bhr", name: "Bahrain" },
  { id: 50, alpha2: "bd", alpha3: "bgd", name: "Bangladesh" },
  { id: 52, alpha2: "bb", alpha3: "brb", name: "Barbados" },
  { id: 112, alpha2: "by", alpha3: "blr", name: "Belarus" },
  { id: 56, alpha2: "be", alpha3: "bel", name: "Belgium" },
  { id: 84, alpha2: "bz", alpha3: "blz", name: "Belize" },
  { id: 204, alpha2: "bj", alpha3: "ben", name: "Benin" },
  { id: 64, alpha2: "bt", alpha3: "btn", name: "Bhutan" },
  {
    id: 68,
    alpha2: "bo",
    alpha3: "bol",
    name: "Bolivia, Plurinational State of",
  },
  { id: 70, alpha2: "ba", alpha3: "bih", name: "Bosnia and Herzegovina" },
  { id: 72, alpha2: "bw", alpha3: "bwa", name: "Botswana" },
  { id: 76, alpha2: "br", alpha3: "bra", name: "Brazil" },
  { id: 96, alpha2: "bn", alpha3: "brn", name: "Brunei Darussalam" },
  { id: 100, alpha2: "bg", alpha3: "bgr", name: "Bulgaria" },
  { id: 854, alpha2: "bf", alpha3: "bfa", name: "Burkina Faso" },
  { id: 108, alpha2: "bi", alpha3: "bdi", name: "Burundi" },
  { id: 132, alpha2: "cv", alpha3: "cpv", name: "Cabo Verde" },
  { id: 116, alpha2: "kh", alpha3: "khm", name: "Cambodia" },
  { id: 120, alpha2: "cm", alpha3: "cmr", name: "Cameroon" },
  { id: 124, alpha2: "ca", alpha3: "can", name: "Canada" },
  { id: 140, alpha2: "cf", alpha3: "caf", name: "Central African Republic" },
  { id: 148, alpha2: "td", alpha3: "tcd", name: "Chad" },
  { id: 152, alpha2: "cl", alpha3: "chl", name: "Chile" },
  { id: 156, alpha2: "cn", alpha3: "chn", name: "China" },
  { id: 170, alpha2: "co", alpha3: "col", name: "Colombia" },
  { id: 174, alpha2: "km", alpha3: "com", name: "Comoros" },
  { id: 178, alpha2: "cg", alpha3: "cog", name: "Congo" },
  {
    id: 180,
    alpha2: "cd",
    alpha3: "cod",
    name: "Congo, Democratic Republic of the",
  },
  { id: 188, alpha2: "cr", alpha3: "cri", name: "Costa Rica" },
  { id: 384, alpha2: "ci", alpha3: "civ", name: "Côte d'Ivoire" },
  { id: 191, alpha2: "hr", alpha3: "hrv", name: "Croatia" },
  { id: 192, alpha2: "cu", alpha3: "cub", name: "Cuba" },
  { id: 196, alpha2: "cy", alpha3: "cyp", name: "Cyprus" },
  { id: 203, alpha2: "cz", alpha3: "cze", name: "Czechia" },
  { id: 208, alpha2: "dk", alpha3: "dnk", name: "Denmark" },
  { id: 262, alpha2: "dj", alpha3: "dji", name: "Djibouti" },
  { id: 212, alpha2: "dm", alpha3: "dma", name: "Dominica" },
  { id: 214, alpha2: "do", alpha3: "dom", name: "Dominican Republic" },
  { id: 218, alpha2: "ec", alpha3: "ecu", name: "Ecuador" },
  { id: 818, alpha2: "eg", alpha3: "egy", name: "Egypt" },
  { id: 222, alpha2: "sv", alpha3: "slv", name: "El Salvador" },
  { id: 226, alpha2: "gq", alpha3: "gnq", name: "Equatorial Guinea" },
  { id: 232, alpha2: "er", alpha3: "eri", name: "Eritrea" },
  { id: 233, alpha2: "ee", alpha3: "est", name: "Estonia" },
  { id: 748, alpha2: "sz", alpha3: "swz", name: "Eswatini" },
  { id: 231, alpha2: "et", alpha3: "eth", name: "Ethiopia" },
  { id: 242, alpha2: "fj", alpha3: "fji", name: "Fiji" },
  { id: 246, alpha2: "fi", alpha3: "fin", name: "Finland" },
  { id: 250, alpha2: "fr", alpha3: "fra", name: "France" },
  { id: 266, alpha2: "ga", alpha3: "gab", name: "Gabon" },
  { id: 270, alpha2: "gm", alpha3: "gmb", name: "Gambia" },
  { id: 268, alpha2: "ge", alpha3: "geo", name: "Georgia" },
  { id: 276, alpha2: "de", alpha3: "deu", name: "Germany" },
  { id: 288, alpha2: "gh", alpha3: "gha", name: "Ghana" },
  { id: 300, alpha2: "gr", alpha3: "grc", name: "Greece" },
  { id: 308, alpha2: "gd", alpha3: "grd", name: "Grenada" },
  { id: 320, alpha2: "gt", alpha3: "gtm", name: "Guatemala" },
  { id: 324, alpha2: "gn", alpha3: "gin", name: "Guinea" },
  { id: 624, alpha2: "gw", alpha3: "gnb", name: "Guinea-Bissau" },
  { id: 328, alpha2: "gy", alpha3: "guy", name: "Guyana" },
  { id: 332, alpha2: "ht", alpha3: "hti", name: "Haiti" },
  { id: 336, alpha2: "va", alpha3: "vat", name: "Holy See" },
  { id: 340, alpha2: "hn", alpha3: "hnd", name: "Honduras" },
  { id: 348, alpha2: "hu", alpha3: "hun", name: "Hungary" },
  { id: 352, alpha2: "is", alpha3: "isl", name: "Iceland" },
  { id: 356, alpha2: "in", alpha3: "ind", name: "India" },
  { id: 360, alpha2: "id", alpha3: "idn", name: "Indonesia" },
  { id: 364, alpha2: "ir", alpha3: "irn", name: "Iran, Islamic Republic of" },
  { id: 368, alpha2: "iq", alpha3: "irq", name: "Iraq" },
  { id: 372, alpha2: "ie", alpha3: "irl", name: "Ireland" },
  // { id: 376, alpha2: "il", alpha3: "isr", name: "Israel" },
  { id: 380, alpha2: "it", alpha3: "ita", name: "Italy" },
  { id: 388, alpha2: "jm", alpha3: "jam", name: "Jamaica" },
  { id: 392, alpha2: "jp", alpha3: "jpn", name: "Japan" },
  { id: 400, alpha2: "jo", alpha3: "jor", name: "Jordan" },
  { id: 398, alpha2: "kz", alpha3: "kaz", name: "Kazakhstan" },
  { id: 404, alpha2: "ke", alpha3: "ken", name: "Kenya" },
  { id: 296, alpha2: "ki", alpha3: "kir", name: "Kiribati" },
  {
    id: 408,
    alpha2: "kp",
    alpha3: "prk",
    name: "Korea, Democratic People's Republic of",
  },
  { id: 410, alpha2: "kr", alpha3: "kor", name: "Korea, Republic of" },
  { id: 414, alpha2: "kw", alpha3: "kwt", name: "Kuwait" },
  { id: 417, alpha2: "kg", alpha3: "kgz", name: "Kyrgyzstan" },
  {
    id: 418,
    alpha2: "la",
    alpha3: "lao",
    name: "Lao People's Democratic Republic",
  },
  { id: 428, alpha2: "lv", alpha3: "lva", name: "Latvia" },
  { id: 422, alpha2: "lb", alpha3: "lbn", name: "Lebanon" },
  { id: 426, alpha2: "ls", alpha3: "lso", name: "Lesotho" },
  { id: 430, alpha2: "lr", alpha3: "lbr", name: "Liberia" },
  { id: 434, alpha2: "ly", alpha3: "lby", name: "Libya" },
  { id: 438, alpha2: "li", alpha3: "lie", name: "Liechtenstein" },
  { id: 440, alpha2: "lt", alpha3: "ltu", name: "Lithuania" },
  { id: 442, alpha2: "lu", alpha3: "lux", name: "Luxembourg" },
  { id: 450, alpha2: "mg", alpha3: "mdg", name: "Madagascar" },
  { id: 454, alpha2: "mw", alpha3: "mwi", name: "Malawi" },
  { id: 458, alpha2: "my", alpha3: "mys", name: "Malaysia" },
  { id: 462, alpha2: "mv", alpha3: "mdv", name: "Maldives" },
  { id: 466, alpha2: "ml", alpha3: "mli", name: "Mali" },
  { id: 470, alpha2: "mt", alpha3: "mlt", name: "Malta" },
  { id: 584, alpha2: "mh", alpha3: "mhl", name: "Marshall Islands" },
  { id: 478, alpha2: "mr", alpha3: "mrt", name: "Mauritania" },
  { id: 480, alpha2: "mu", alpha3: "mus", name: "Mauritius" },
  { id: 484, alpha2: "mx", alpha3: "mex", name: "Mexico" },
  {
    id: 583,
    alpha2: "fm",
    alpha3: "fsm",
    name: "Micronesia, Federated States of",
  },
  { id: 498, alpha2: "md", alpha3: "mda", name: "Moldova, Republic of" },
  { id: 492, alpha2: "mc", alpha3: "mco", name: "Monaco" },
  { id: 496, alpha2: "mn", alpha3: "mng", name: "Mongolia" },
  { id: 499, alpha2: "me", alpha3: "mne", name: "Montenegro" },
  { id: 504, alpha2: "ma", alpha3: "mar", name: "Morocco" },
  { id: 508, alpha2: "mz", alpha3: "moz", name: "Mozambique" },
  { id: 104, alpha2: "mm", alpha3: "mmr", name: "Myanmar" },
  { id: 516, alpha2: "na", alpha3: "nam", name: "Namibia" },
  { id: 520, alpha2: "nr", alpha3: "nru", name: "Nauru" },
  { id: 524, alpha2: "np", alpha3: "npl", name: "Nepal" },
  { id: 528, alpha2: "nl", alpha3: "nld", name: "Netherlands" },
  { id: 554, alpha2: "nz", alpha3: "nzl", name: "New Zealand" },
  { id: 558, alpha2: "ni", alpha3: "nic", name: "Nicaragua" },
  { id: 562, alpha2: "ne", alpha3: "ner", name: "Niger" },
  { id: 566, alpha2: "ng", alpha3: "nga", name: "Nigeria" },
  { id: 807, alpha2: "mk", alpha3: "mkd", name: "North Macedonia" },
  { id: 578, alpha2: "no", alpha3: "nor", name: "Norway" },
  { id: 512, alpha2: "om", alpha3: "omn", name: "Oman" },
  { id: 586, alpha2: "pk", alpha3: "pak", name: "Pakistan" },
  { id: 585, alpha2: "pw", alpha3: "plw", name: "Palau" },
  { id: 275, alpha2: "ps", alpha3: "pse", name: "Palestine" },
  { id: 591, alpha2: "pa", alpha3: "pan", name: "Panama" },
  { id: 598, alpha2: "pg", alpha3: "png", name: "Papua New Guinea" },
  { id: 600, alpha2: "py", alpha3: "pry", name: "Paraguay" },
  { id: 604, alpha2: "pe", alpha3: "per", name: "Peru" },
  { id: 608, alpha2: "ph", alpha3: "phl", name: "Philippines" },
  { id: 616, alpha2: "pl", alpha3: "pol", name: "Poland" },
  { id: 620, alpha2: "pt", alpha3: "prt", name: "Portugal" },
  { id: 634, alpha2: "qa", alpha3: "qat", name: "Qatar" },
  { id: 642, alpha2: "ro", alpha3: "rou", name: "Romania" },
  { id: 643, alpha2: "ru", alpha3: "rus", name: "Russian Federation" },
  { id: 646, alpha2: "rw", alpha3: "rwa", name: "Rwanda" },
  { id: 659, alpha2: "kn", alpha3: "kna", name: "Saint Kitts and Nevis" },
  { id: 662, alpha2: "lc", alpha3: "lca", name: "Saint Lucia" },
  {
    id: 670,
    alpha2: "vc",
    alpha3: "vct",
    name: "Saint Vincent and the Grenadines",
  },
  { id: 882, alpha2: "ws", alpha3: "wsm", name: "Samoa" },
  { id: 674, alpha2: "sm", alpha3: "smr", name: "San Marino" },
  { id: 678, alpha2: "st", alpha3: "stp", name: "Sao Tome and Principe" },
  { id: 682, alpha2: "sa", alpha3: "sau", name: "Saudi Arabia" },
  { id: 686, alpha2: "sn", alpha3: "sen", name: "Senegal" },
  { id: 688, alpha2: "rs", alpha3: "srb", name: "Serbia" },
  { id: 690, alpha2: "sc", alpha3: "syc", name: "Seychelles" },
  { id: 694, alpha2: "sl", alpha3: "sle", name: "Sierra Leone" },
  { id: 702, alpha2: "sg", alpha3: "sgp", name: "Singapore" },
  { id: 703, alpha2: "sk", alpha3: "svk", name: "Slovakia" },
  { id: 705, alpha2: "si", alpha3: "svn", name: "Slovenia" },
  { id: 90, alpha2: "sb", alpha3: "slb", name: "Solomon Islands" },
  { id: 706, alpha2: "so", alpha3: "som", name: "Somalia" },
  { id: 710, alpha2: "za", alpha3: "zaf", name: "South Africa" },
  { id: 728, alpha2: "ss", alpha3: "ssd", name: "South Sudan" },
  { id: 724, alpha2: "es", alpha3: "esp", name: "Spain" },
  { id: 144, alpha2: "lk", alpha3: "lka", name: "Sri Lanka" },
  { id: 729, alpha2: "sd", alpha3: "sdn", name: "Sudan" },
  { id: 740, alpha2: "sr", alpha3: "sur", name: "Suriname" },
  { id: 752, alpha2: "se", alpha3: "swe", name: "Sweden" },
  { id: 756, alpha2: "ch", alpha3: "che", name: "Switzerland" },
  { id: 760, alpha2: "sy", alpha3: "syr", name: "Syrian Arab Republic" },
  { id: 762, alpha2: "tj", alpha3: "tjk", name: "Tajikistan" },
  {
    id: 834,
    alpha2: "tz",
    alpha3: "tza",
    name: "Tanzania, United Republic of",
  },
  { id: 764, alpha2: "th", alpha3: "tha", name: "Thailand" },
  { id: 626, alpha2: "tl", alpha3: "tls", name: "Timor-Leste" },
  { id: 768, alpha2: "tg", alpha3: "tgo", name: "Togo" },
  { id: 776, alpha2: "to", alpha3: "ton", name: "Tonga" },
  { id: 780, alpha2: "tt", alpha3: "tto", name: "Trinidad and Tobago" },
  { id: 788, alpha2: "tn", alpha3: "tun", name: "Tunisia" },
  { id: 792, alpha2: "tr", alpha3: "tur", name: "Türkiye" },
  { id: 795, alpha2: "tm", alpha3: "tkm", name: "Turkmenistan" },
  { id: 798, alpha2: "tv", alpha3: "tuv", name: "Tuvalu" },
  { id: 800, alpha2: "ug", alpha3: "uga", name: "Uganda" },
  { id: 804, alpha2: "ua", alpha3: "ukr", name: "Ukraine" },
  { id: 784, alpha2: "ae", alpha3: "are", name: "United Arab Emirates" },
  {
    id: 826,
    alpha2: "gb",
    alpha3: "gbr",
    name: "United Kingdom of Great Britain and Northern Ireland",
  },
  { id: 840, alpha2: "us", alpha3: "usa", name: "United States of America" },
  { id: 858, alpha2: "uy", alpha3: "ury", name: "Uruguay" },
  { id: 860, alpha2: "uz", alpha3: "uzb", name: "Uzbekistan" },
  { id: 548, alpha2: "vu", alpha3: "vut", name: "Vanuatu" },
  {
    id: 862,
    alpha2: "ve",
    alpha3: "ven",
    name: "Venezuela, Bolivarian Republic of",
  },
  { id: 704, alpha2: "vn", alpha3: "vnm", name: "Viet Nam" },
  { id: 887, alpha2: "ye", alpha3: "yem", name: "Yemen" },
  { id: 894, alpha2: "zm", alpha3: "zmb", name: "Zambia" },
  { id: 716, alpha2: "zw", alpha3: "zwe", name: "Zimbabwe" },
];

type CountrySimple = {
  alpha2: CountryCode;
  name: string;
};

export const COUNTRIES_SIMPLE: CountrySimple[] = [
  { alpha2: "af", name: "Afghanistan" },
  { alpha2: "al", name: "Albania" },
  { alpha2: "dz", name: "Algeria" },
  { alpha2: "ad", name: "Andorra" },
  { alpha2: "ao", name: "Angola" },
  { alpha2: "ag", name: "Antigua and Barbuda" },
  { alpha2: "ar", name: "Argentina" },
  { alpha2: "am", name: "Armenia" },
  { alpha2: "au", name: "Australia" },
  { alpha2: "at", name: "Austria" },
  { alpha2: "az", name: "Azerbaijan" },
  { alpha2: "bs", name: "Bahamas" },
  { alpha2: "bh", name: "Bahrain" },
  { alpha2: "bd", name: "Bangladesh" },
  { alpha2: "bb", name: "Barbados" },
  { alpha2: "by", name: "Belarus" },
  { alpha2: "be", name: "Belgium" },
  { alpha2: "bz", name: "Belize" },
  { alpha2: "bj", name: "Benin" },
  { alpha2: "bt", name: "Bhutan" },
  { alpha2: "bo", name: "Bolivia, Plurinational State of" },
  { alpha2: "ba", name: "Bosnia and Herzegovina" },
  { alpha2: "bw", name: "Botswana" },
  { alpha2: "br", name: "Brazil" },
  { alpha2: "bn", name: "Brunei Darussalam" },
  { alpha2: "bg", name: "Bulgaria" },
  { alpha2: "bf", name: "Burkina Faso" },
  { alpha2: "bi", name: "Burundi" },
  { alpha2: "cv", name: "Cabo Verde" },
  { alpha2: "kh", name: "Cambodia" },
  { alpha2: "cm", name: "Cameroon" },
  { alpha2: "ca", name: "Canada" },
  { alpha2: "cf", name: "Central African Republic" },
  { alpha2: "td", name: "Chad" },
  { alpha2: "cl", name: "Chile" },
  { alpha2: "cn", name: "China" },
  { alpha2: "co", name: "Colombia" },
  { alpha2: "km", name: "Comoros" },
  { alpha2: "cg", name: "Congo" },
  { alpha2: "cd", name: "Congo, Democratic Republic of the" },
  { alpha2: "cr", name: "Costa Rica" },
  { alpha2: "ci", name: "Côte d'Ivoire" },
  { alpha2: "hr", name: "Croatia" },
  { alpha2: "cu", name: "Cuba" },
  { alpha2: "cy", name: "Cyprus" },
  { alpha2: "cz", name: "Czechia" },
  { alpha2: "dk", name: "Denmark" },
  { alpha2: "dj", name: "Djibouti" },
  { alpha2: "dm", name: "Dominica" },
  { alpha2: "do", name: "Dominican Republic" },
  { alpha2: "ec", name: "Ecuador" },
  { alpha2: "eg", name: "Egypt" },
  { alpha2: "sv", name: "El Salvador" },
  { alpha2: "gq", name: "Equatorial Guinea" },
  { alpha2: "er", name: "Eritrea" },
  { alpha2: "ee", name: "Estonia" },
  { alpha2: "sz", name: "Eswatini" },
  { alpha2: "et", name: "Ethiopia" },
  { alpha2: "fj", name: "Fiji" },
  { alpha2: "fi", name: "Finland" },
  { alpha2: "fr", name: "France" },
  { alpha2: "ga", name: "Gabon" },
  { alpha2: "gm", name: "Gambia" },
  { alpha2: "ge", name: "Georgia" },
  { alpha2: "de", name: "Germany" },
  { alpha2: "gh", name: "Ghana" },
  { alpha2: "gr", name: "Greece" },
  { alpha2: "gd", name: "Grenada" },
  { alpha2: "gt", name: "Guatemala" },
  { alpha2: "gn", name: "Guinea" },
  { alpha2: "gw", name: "Guinea-Bissau" },
  { alpha2: "gy", name: "Guyana" },
  { alpha2: "ht", name: "Haiti" },
  { alpha2: "va", name: "Holy See" },
  { alpha2: "hn", name: "Honduras" },
  { alpha2: "hu", name: "Hungary" },
  { alpha2: "is", name: "Iceland" },
  { alpha2: "in", name: "India" },
  { alpha2: "id", name: "Indonesia" },
  { alpha2: "ir", name: "Iran, Islamic Republic of" },
  { alpha2: "iq", name: "Iraq" },
  { alpha2: "ie", name: "Ireland" },
  // { alpha2: "il", name: "Israel" },
  { alpha2: "it", name: "Italy" },
  { alpha2: "jm", name: "Jamaica" },
  { alpha2: "jp", name: "Japan" },
  { alpha2: "jo", name: "Jordan" },
  { alpha2: "kz", name: "Kazakhstan" },
  { alpha2: "ke", name: "Kenya" },
  { alpha2: "ki", name: "Kiribati" },
  { alpha2: "kp", name: "Korea, Democratic People's Republic of" },
  { alpha2: "kr", name: "Korea, Republic of" },
  { alpha2: "kw", name: "Kuwait" },
  { alpha2: "kg", name: "Kyrgyzstan" },
  { alpha2: "la", name: "Lao People's Democratic Republic" },
  { alpha2: "lv", name: "Latvia" },
  { alpha2: "lb", name: "Lebanon" },
  { alpha2: "ls", name: "Lesotho" },
  { alpha2: "lr", name: "Liberia" },
  { alpha2: "ly", name: "Libya" },
  { alpha2: "li", name: "Liechtenstein" },
  { alpha2: "lt", name: "Lithuania" },
  { alpha2: "lu", name: "Luxembourg" },
  { alpha2: "mg", name: "Madagascar" },
  { alpha2: "mw", name: "Malawi" },
  { alpha2: "my", name: "Malaysia" },
  { alpha2: "mv", name: "Maldives" },
  { alpha2: "ml", name: "Mali" },
  { alpha2: "mt", name: "Malta" },
  { alpha2: "mh", name: "Marshall Islands" },
  { alpha2: "mr", name: "Mauritania" },
  { alpha2: "mu", name: "Mauritius" },
  { alpha2: "mx", name: "Mexico" },
  { alpha2: "fm", name: "Micronesia, Federated States of" },
  { alpha2: "md", name: "Moldova, Republic of" },
  { alpha2: "mc", name: "Monaco" },
  { alpha2: "mn", name: "Mongolia" },
  { alpha2: "me", name: "Montenegro" },
  { alpha2: "ma", name: "Morocco" },
  { alpha2: "mz", name: "Mozambique" },
  { alpha2: "mm", name: "Myanmar" },
  { alpha2: "na", name: "Namibia" },
  { alpha2: "nr", name: "Nauru" },
  { alpha2: "np", name: "Nepal" },
  { alpha2: "nl", name: "Netherlands" },
  { alpha2: "nz", name: "New Zealand" },
  { alpha2: "ni", name: "Nicaragua" },
  { alpha2: "ne", name: "Niger" },
  { alpha2: "ng", name: "Nigeria" },
  { alpha2: "mk", name: "North Macedonia" },
  { alpha2: "no", name: "Norway" },
  { alpha2: "om", name: "Oman" },
  { alpha2: "pk", name: "Pakistan" },
  { alpha2: "pw", name: "Palau" },
  { alpha2: "ps", name: "Palestine" },
  { alpha2: "pa", name: "Panama" },
  { alpha2: "pg", name: "Papua New Guinea" },
  { alpha2: "py", name: "Paraguay" },
  { alpha2: "pe", name: "Peru" },
  { alpha2: "ph", name: "Philippines" },
  { alpha2: "pl", name: "Poland" },
  { alpha2: "pt", name: "Portugal" },
  { alpha2: "qa", name: "Qatar" },
  { alpha2: "ro", name: "Romania" },
  { alpha2: "ru", name: "Russian Federation" },
  { alpha2: "rw", name: "Rwanda" },
  { alpha2: "kn", name: "Saint Kitts and Nevis" },
  { alpha2: "lc", name: "Saint Lucia" },
  { alpha2: "vc", name: "Saint Vincent and the Grenadines" },
  { alpha2: "ws", name: "Samoa" },
  { alpha2: "sm", name: "San Marino" },
  { alpha2: "st", name: "Sao Tome and Principe" },
  { alpha2: "sa", name: "Saudi Arabia" },
  { alpha2: "sn", name: "Senegal" },
  { alpha2: "rs", name: "Serbia" },
  { alpha2: "sc", name: "Seychelles" },
  { alpha2: "sl", name: "Sierra Leone" },
  { alpha2: "sg", name: "Singapore" },
  { alpha2: "sk", name: "Slovakia" },
  { alpha2: "si", name: "Slovenia" },
  { alpha2: "sb", name: "Solomon Islands" },
  { alpha2: "so", name: "Somalia" },
  { alpha2: "za", name: "South Africa" },
  { alpha2: "ss", name: "South Sudan" },
  { alpha2: "es", name: "Spain" },
  { alpha2: "lk", name: "Sri Lanka" },
  { alpha2: "sd", name: "Sudan" },
  { alpha2: "sr", name: "Suriname" },
  { alpha2: "se", name: "Sweden" },
  { alpha2: "ch", name: "Switzerland" },
  { alpha2: "sy", name: "Syrian Arab Republic" },
  { alpha2: "tj", name: "Tajikistan" },
  { alpha2: "tz", name: "Tanzania, United Republic of" },
  { alpha2: "th", name: "Thailand" },
  { alpha2: "tl", name: "Timor-Leste" },
  { alpha2: "tg", name: "Togo" },
  { alpha2: "to", name: "Tonga" },
  { alpha2: "tt", name: "Trinidad and Tobago" },
  { alpha2: "tn", name: "Tunisia" },
  { alpha2: "tr", name: "Türkiye" },
  { alpha2: "tm", name: "Turkmenistan" },
  { alpha2: "tv", name: "Tuvalu" },
  { alpha2: "ug", name: "Uganda" },
  { alpha2: "ua", name: "Ukraine" },
  { alpha2: "ae", name: "United Arab Emirates" },
  {
    alpha2: "gb",
    name: "United Kingdom of Great Britain and Northern Ireland",
  },
  { alpha2: "us", name: "United States of America" },
  { alpha2: "uy", name: "Uruguay" },
  { alpha2: "uz", name: "Uzbekistan" },
  { alpha2: "vu", name: "Vanuatu" },
  { alpha2: "ve", name: "Venezuela, Bolivarian Republic of" },
  { alpha2: "vn", name: "Viet Nam" },
  { alpha2: "ye", name: "Yemen" },
  { alpha2: "zm", name: "Zambia" },
  { alpha2: "zw", name: "Zimbabwe" },
];

export const COUNTRIES_OBJ: Record<CountryCode, Country> = COUNTRIES.reduce((acc, country) => {
  acc[country.alpha2] = country;
  return acc;
}, {} as Record<CountryCode, Country>);

type C = {
  [key: string]: string;
};

export const COUNTRIES_FOR_SEARCH: C = {
  af: "Afghanistan Afghanistan أفغانستان af afg",
  al: "Albania Albanie ألبانيا al alb",
  dz: "Algeria Algérie الجزائر dz dza",
  ad: "Andorra Andorre أندورا ad and",
  ao: "Angola Angola أنغولا ao ago",
  ag: "Antigua and Barbuda Antigua-et-Barbuda أنتيغوا وباربودا ag atg",
  ar: "Argentina Argentine الأرجنتين ar arg",
  am: "Armenia Arménie أرمينيا am arm",
  au: "Australia Australie أستراليا au aus",
  at: "Austria Autriche النمسا at aut",
  az: "Azerbaijan Azerbaïdjan أذربيجان az aze",
  bs: "Bahamas Bahamas باهاماس bs bhs",
  bh: "Bahrain Bahreïn البحرين bh bhr",
  bd: "Bangladesh Bangladesh بنغلاديش bd bgd",
  bb: "Barbados Barbade باربادوس bb brb",
  by: "Belarus Biélorussie بيلاروس by blr",
  be: "Belgium Belgique بلجيكا be bel",
  bz: "Belize Belize بليز bz blz",
  bj: "Benin Bénin بنين bj ben",
  bt: "Bhutan Bhoutan بوتان bt btn",
  bo: "Bolivia, Plurinational State of Bolivie بوليفيا bo bol",
  ba: "Bosnia and Herzegovina Bosnie-Herzégovine البوسنة والهرسك ba bih",
  bw: "Botswana Botswana بوتسوانا bw bwa",
  br: "Brazil Brésil البرازيل br bra",
  bn: "Brunei Darussalam Brunei بروناي bn brn",
  bg: "Bulgaria Bulgarie بلغاريا bg bgr",
  bf: "Burkina Faso Burkina Faso بوركينا فاسو bf bfa",
  bi: "Burundi Burundi بوروندي bi bdi",
  cv: "Cabo Verde Cap-Vert الرأس الأخضر cv cpv",
  kh: "Cambodia Cambodge كمبوديا kh khm",
  cm: "Cameroon Cameroun الكاميرون cm cmr",
  ca: "Canada Canada كندا ca can",
  cf: "Central African Republic République centrafricaine جمهورية إفريقيا الوسطى cf caf",
  td: "Chad Tchad تشاد td tcd",
  cl: "Chile Chili تشيلي cl chl",
  cn: "China Chine الصين cn chn",
  co: "Colombia Colombie كولومبيا co col",
  km: "Comoros Comores جزر القمر km com",
  cg: "Congo République du Congo جمهورية الكونغو cg cog",
  cd: "Congo, Democratic Republic of the République démocratique du Congo جمهورية الكونغو الديمقراطية cd cod",
  cr: "Costa Rica Costa Rica كوستاريكا cr cri",
  ci: "Côte d'Ivoire Côte d'Ivoire ساحل العاج ci civ",
  hr: "Croatia Croatie كرواتيا hr hrv",
  cu: "Cuba Cuba كوبا cu cub",
  cy: "Cyprus Chypre قبرص cy cyp",
  cz: "Czechia Tchéquie جمهورية التشيك cz cze",
  dk: "Denmark Danemark الدنمارك dk dnk",
  dj: "Djibouti Djibouti جيبوتي dj dji",
  dm: "Dominica Dominique دومينيكا dm dma",
  do: "Dominican Republic République dominicaine جمهورية الدومينيكان do dom",
  ec: "Ecuador Équateur الإكوادور ec ecu",
  eg: "Egypt Égypte مصر eg egy",
  sv: "El Salvador Salvador السلفادور sv slv",
  gq: "Equatorial Guinea Guinée équatoriale غينيا الاستوائية gq gnq",
  er: "Eritrea Érythrée إرتريا er eri",
  ee: "Estonia Estonie إستونيا ee est",
  sz: "Eswatini Eswatini إسواتيني sz swz",
  et: "Ethiopia Éthiopie إثيوبيا et eth",
  fj: "Fiji Fidji فيجي fj fji",
  fi: "Finland Finlande فنلندا fi fin",
  fr: "France France فرنسا fr fra",
  ga: "Gabon Gabon الغابون ga gab",
  gm: "Gambia Gambie غامبيا gm gmb",
  ge: "Georgia Géorgie جورجيا ge geo",
  de: "Germany Allemagne ألمانيا de deu",
  gh: "Ghana Ghana غانا gh gha",
  gr: "Greece Grèce اليونان gr grc",
  gd: "Grenada Grenade غرينادا gd grd",
  gt: "Guatemala Guatemala غواتيمالا gt gtm",
  gn: "Guinea Guinée غينيا gn gin",
  gw: "Guinea-Bissau Guinée-Bissau غينيا بيساو gw gnb",
  gy: "Guyana Guyana غيانا gy guy",
  ht: "Haiti Haïti هايتي ht hti",
  va: "Holy See Saint-Siège (État de la Cité du Vatican) الفاتيكان va vat",
  hn: "Honduras Honduras هندوراس hn hnd",
  hu: "Hungary Hongrie المجر hu hun",
  is: "Iceland Islande آيسلندا is isl",
  in: "India Inde الهند in ind",
  id: "Indonesia Indonésie إندونيسيا id idn",
  ir: "Iran, Islamic Republic of Iran إيران ir irn",
  iq: "Iraq Irak العراق iq irq",
  ie: "Ireland Irlande أيرلندا ie irl",
  it: "Italy Italie إيطاليا it ita",
  jm: "Jamaica Jamaïque جامايكا jm jam",
  jp: "Japan Japon اليابان jp jpn",
  jo: "Jordan Jordanie الأردن jo jor",
  kz: "Kazakhstan Kazakhstan كازاخستان kz kaz",
  ke: "Kenya Kenya كينيا ke ken",
  ki: "Kiribati Kiribati كيريباتي ki kir",
  kp: "Korea, Democratic People's Republic of Corée du Nord كوريا الشمالية kp prk",
  kr: "Korea, Republic of Corée du Sud كوريا الجنوبية kr kor",
  kw: "Kuwait Koweït الكويت kw kwt",
  kg: "Kyrgyzstan Kirghizistan قيرغيزستان kg kgz",
  la: "Lao People's Democratic Republic Laos لاوس la lao",
  lv: "Latvia Lettonie لاتفيا lv lva",
  lb: "Lebanon Liban لبنان lb lbn",
  ls: "Lesotho Lesotho ليسوتو ls lso",
  lr: "Liberia Liberia ليبيريا lr lbr",
  ly: "Libya Libye ليبيا ly lby",
  li: "Liechtenstein Liechtenstein ليختنشتاين li lie",
  lt: "Lithuania Lituanie ليتوانيا lt ltu",
  lu: "Luxembourg Luxembourg لوكسمبورغ lu lux",
  mg: "Madagascar Madagascar مدغشقر mg mdg",
  mw: "Malawi Malawi مالاوي mw mwi",
  my: "Malaysia Malaisie ماليزيا my mys",
  mv: "Maldives Maldives جزر المالديف mv mdv",
  ml: "Mali Mali مالي ml mli",
  mt: "Malta Malte مالطا mt mlt",
  mh: "Marshall Islands Îles Marshall جزر مارشال mh mhl",
  mr: "Mauritania Mauritanie موريتانيا mr mrt",
  mu: "Mauritius Maurice موريشيوس mu mus",
  mx: "Mexico Mexique المكسيك mx mex",
  fm: "Micronesia, Federated States of États fédérés de Micronésie ولايات ميكرونيسيا المتحدة fm fsm",
  md: "Moldova, Republic of Moldavie مولدوفا md mda",
  mc: "Monaco Monaco موناكو mc mco",
  mn: "Mongolia Mongolie منغوليا mn mng",
  me: "Montenegro Monténégro الجبل الأسود me mne",
  ma: "Morocco Maroc المغرب ma mar",
  mz: "Mozambique Mozambique موزمبيق mz moz",
  mm: "Myanmar Birmanie ميانمار mm mmr",
  na: "Namibia Namibie ناميبيا na nam",
  nr: "Nauru Nauru ناورو nr nru",
  np: "Nepal Népal نيبال np npl",
  nl: "Netherlands Pays-Bas هولندا nl nld",
  nz: "New Zealand Nouvelle-Zélande نيوزيلندا nz nzl",
  ni: "Nicaragua Nicaragua نيكاراغوا ni nic",
  ne: "Niger Niger النيجر ne ner",
  ng: "Nigeria Nigeria نيجيريا ng nga",
  mk: "North Macedonia Macédoine du Nord مقدونيا mk mkd",
  no: "Norway Norvège النرويج no nor",
  om: "Oman Oman عُمان om omn",
  pk: "Pakistan Pakistan باكستان pk pak",
  pw: "Palau Palaos بالاو pw plw",
  ps: "Palestine, State of Palestine فلسطين ps pse",
  pa: "Panama Panama بنما pa pan",
  pg: "Papua New Guinea Papouasie-Nouvelle-Guinée بابوا غينيا الجديدة pg png",
  py: "Paraguay Paraguay باراغواي py pry",
  pe: "Peru Pérou بيرو pe per",
  ph: "Philippines Philippines الفلبين ph phl",
  pl: "Poland Pologne بولندا pl pol",
  pt: "Portugal Portugal البرتغال pt prt",
  qa: "Qatar Qatar قطر qa qat",
  ro: "Romania Roumanie رومانيا ro rou",
  ru: "Russian Federation Russie روسيا ru rus",
  rw: "Rwanda Rwanda رواندا rw rwa",
  kn: "Saint Kitts and Nevis Saint-Christophe-et-Niévès سانت كيتس ونيفيس kn kna",
  lc: "Saint Lucia Sainte-Lucie سانت لوسيا lc lca",
  vc: "Saint Vincent and the Grenadines Saint-Vincent-et-les-Grenadines سانت فينسنت والغرينادين vc vct",
  ws: "Samoa Samoa ساموا ws wsm",
  sm: "San Marino Saint-Marin سان مارينو sm smr",
  st: "Sao Tome and Principe Sao Tomé-et-Principe ساو تومي وبرينسيب st stp",
  sa: "Saudi Arabia Arabie saoudite السعودية sa sau",
  sn: "Senegal Sénégal السنغال sn sen",
  rs: "Serbia Serbie صربيا rs srb",
  sc: "Seychelles Seychelles سيشل sc syc",
  sl: "Sierra Leone Sierra Leone سيراليون sl sle",
  sg: "Singapore Singapour سنغافورة sg sgp",
  sk: "Slovakia Slovaquie سلوفاكيا sk svk",
  si: "Slovenia Slovénie سلوفينيا si svn",
  sb: "Solomon Islands Îles Salomon جزر سليمان sb slb",
  so: "Somalia Somalie الصومال so som",
  za: "South Africa Afrique du Sud جنوب إفريقيا za zaf",
  ss: "South Sudan Soudan du Sud جنوب السودان ss ssd",
  es: "Spain Espagne إسبانيا es esp",
  lk: "Sri Lanka Sri Lanka سريلانكا lk lka",
  sd: "Sudan Soudan السودان sd sdn",
  sr: "Suriname Suriname سورينام sr sur",
  se: "Sweden Suède السويد se swe",
  ch: "Switzerland Suisse سويسرا ch che",
  sy: "Syrian Arab Republic Syrie سوريا sy syr",
  tj: "Tajikistan Tadjikistan طاجيكستان tj tjk",
  tz: "Tanzania, United Republic of Tanzanie تنزانيا tz tza",
  th: "Thailand Thaïlande تايلاند th tha",
  tl: "Timor-Leste Timor oriental تيمور الشرقية tl tls",
  tg: "Togo Togo توغو tg tgo",
  to: "Tonga Tonga تونغا to ton",
  tt: "Trinidad and Tobago Trinité-et-Tobago ترينيداد وتوباغو tt tto",
  tn: "Tunisia Tunisie تونس tn tun",
  tr: "Türkiye Turquie تركيا tr tur",
  tm: "Turkmenistan Turkménistan تركمانستان tm tkm",
  tv: "Tuvalu Tuvalu توفالو tv tuv",
  ug: "Uganda Ouganda أوغندا ug uga",
  ua: "Ukraine Ukraine أوكرانيا ua ukr",
  ae: "United Arab Emirates Émirats arabes unis الإمارات العربية المتحدة ae are",
  gb: "United Kingdom of Great Britain and Northern Ireland Royaume-Uni المملكة المتحدة gb gbr",
  us: "United States of America États-Unis الولايات المتحدة us usa",
  uy: "Uruguay Uruguay الأوروغواي uy ury",
  uz: "Uzbekistan Ouzbékistan أوزبكستان uz uzb",
  vu: "Vanuatu Vanuatu فانواتو vu vut",
  ve: "Venezuela, Bolivarian Republic of Venezuela فنزويلا ve ven",
  vn: "Viet Nam Viêt Nam فيتنام vn vnm",
  ye: "Yemen Yémen اليمن ye yem",
  zm: "Zambia Zambie زامبيا zm zmb",
  zw: "Zimbabwe Zimbabwe زيمبابوي zw zwe",
};

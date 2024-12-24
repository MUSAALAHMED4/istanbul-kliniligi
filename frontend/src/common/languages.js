import usFlag from "../assets/images/flags/us.jpg"
import spain from "../assets/images/flags/spain.jpg"
import turkish from "../assets/images/flags/turkish.jpg"
import chinese from "../assets/images/flags/chinese.jpg";
import Ukraine from "../assets/images/flags/Ukraine.jpg"
import Arabic from "../assets/images/flags/Arabic.jpg"



const languages = {
  en: {
    label: "English",
    flag: usFlag,
    shortLabel: "EN"
  },
  ar: {
    label: "العربية",
    flag: Arabic,
    shortLabel: "AR"
  },
  tr: {
    label: "Türkçe",
    flag: turkish,
    shortLabel: "TR"
  },
  sp: {
    label: "Español",
    flag: spain,
    shortLabel: "SP"
  },
  // gr: {
  //   label: "German",
  //   flag: germany,
  // },
  // it: {
  //   label: "Italian",
  //   flag: italy,
  // },
  ch: {
    label: "中文",
    flag: chinese,
    shortLabel: "CN"
  },

  ua: {
    label: "Українська",
    flag: Ukraine, 
    shortLabel: "UA"
  }

}

export default languages

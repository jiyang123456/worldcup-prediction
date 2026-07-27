export interface SeedTeam {
  name: string;
  code: string;
  group: string | null;
  flagUrl: string | null;
}

export const seedTeams: SeedTeam[] = [
  // Group A
  { name: "Mexico 墨西哥", code: "MEX", group: "A", flagUrl: "https://flagcdn.com/w80/mx.png" },
  { name: "South Africa 南非", code: "RSA", group: "A", flagUrl: "https://flagcdn.com/w80/za.png" },
  { name: "South Korea 韩国", code: "KOR", group: "A", flagUrl: "https://flagcdn.com/w80/kr.png" },
  { name: "Czechia 捷克", code: "CZE", group: "A", flagUrl: "https://flagcdn.com/w80/cz.png" },

  // Group B
  { name: "Switzerland 瑞士", code: "SUI", group: "B", flagUrl: "https://flagcdn.com/w80/ch.png" },
  { name: "Canada 加拿大", code: "CAN", group: "B", flagUrl: "https://flagcdn.com/w80/ca.png" },
  { name: "Bosnia-Herzegovina 波黑", code: "BIH", group: "B", flagUrl: "https://flagcdn.com/w80/ba.png" },
  { name: "Qatar 卡塔尔", code: "QAT", group: "B", flagUrl: "https://flagcdn.com/w80/qa.png" },

  // Group C
  { name: "Brazil 巴西", code: "BRA", group: "C", flagUrl: "https://flagcdn.com/w80/br.png" },
  { name: "Morocco 摩洛哥", code: "MAR", group: "C", flagUrl: "https://flagcdn.com/w80/ma.png" },
  { name: "Scotland 苏格兰", code: "SCO", group: "C", flagUrl: "https://flagcdn.com/w80/gb-sct.png" },
  { name: "Haiti 海地", code: "HAI", group: "C", flagUrl: "https://flagcdn.com/w80/ht.png" },

  // Group D
  { name: "United States 美国", code: "USA", group: "D", flagUrl: "https://flagcdn.com/w80/us.png" },
  { name: "Australia 澳大利亚", code: "AUS", group: "D", flagUrl: "https://flagcdn.com/w80/au.png" },
  { name: "Paraguay 巴拉圭", code: "PAR", group: "D", flagUrl: "https://flagcdn.com/w80/py.png" },
  { name: "Turkiye 土耳其", code: "TUR", group: "D", flagUrl: "https://flagcdn.com/w80/tr.png" },

  // Group E
  { name: "Germany 德国", code: "GER", group: "E", flagUrl: "https://flagcdn.com/w80/de.png" },
  { name: "Ivory Coast 科特迪瓦", code: "CIV", group: "E", flagUrl: "https://flagcdn.com/w80/ci.png" },
  { name: "Ecuador 厄瓜多尔", code: "ECU", group: "E", flagUrl: "https://flagcdn.com/w80/ec.png" },
  { name: "Curacao 库拉索", code: "CUW", group: "E", flagUrl: "https://flagcdn.com/w80/cw.png" },

  // Group F
  { name: "Netherlands 荷兰", code: "NED", group: "F", flagUrl: "https://flagcdn.com/w80/nl.png" },
  { name: "Japan 日本", code: "JPN", group: "F", flagUrl: "https://flagcdn.com/w80/jp.png" },
  { name: "Sweden 瑞典", code: "SWE", group: "F", flagUrl: "https://flagcdn.com/w80/se.png" },
  { name: "Tunisia 突尼斯", code: "TUN", group: "F", flagUrl: "https://flagcdn.com/w80/tn.png" },

  // Group G
  { name: "Belgium 比利时", code: "BEL", group: "G", flagUrl: "https://flagcdn.com/w80/be.png" },
  { name: "Egypt 埃及", code: "EGY", group: "G", flagUrl: "https://flagcdn.com/w80/eg.png" },
  { name: "Iran 伊朗", code: "IRN", group: "G", flagUrl: "https://flagcdn.com/w80/ir.png" },
  { name: "New Zealand 新西兰", code: "NZL", group: "G", flagUrl: "https://flagcdn.com/w80/nz.png" },

  // Group H
  { name: "Spain 西班牙", code: "ESP", group: "H", flagUrl: "https://flagcdn.com/w80/es.png" },
  { name: "Cape Verde 佛得角", code: "CPV", group: "H", flagUrl: "https://flagcdn.com/w80/cv.png" },
  { name: "Saudi Arabia 沙特阿拉伯", code: "KSA", group: "H", flagUrl: "https://flagcdn.com/w80/sa.png" },
  { name: "Uruguay 乌拉圭", code: "URU", group: "H", flagUrl: "https://flagcdn.com/w80/uy.png" },

  // Group I
  { name: "France 法国", code: "FRA", group: "I", flagUrl: "https://flagcdn.com/w80/fr.png" },
  { name: "Norway 挪威", code: "NOR", group: "I", flagUrl: "https://flagcdn.com/w80/no.png" },
  { name: "Senegal 塞内加尔", code: "SEN", group: "I", flagUrl: "https://flagcdn.com/w80/sn.png" },
  { name: "Iraq 伊拉克", code: "IRQ", group: "I", flagUrl: "https://flagcdn.com/w80/iq.png" },

  // Group J
  { name: "Argentina 阿根廷", code: "ARG", group: "J", flagUrl: "https://flagcdn.com/w80/ar.png" },
  { name: "Austria 奥地利", code: "AUT", group: "J", flagUrl: "https://flagcdn.com/w80/at.png" },
  { name: "Algeria 阿尔及利亚", code: "ALG", group: "J", flagUrl: "https://flagcdn.com/w80/dz.png" },
  { name: "Jordan 约旦", code: "JOR", group: "J", flagUrl: "https://flagcdn.com/w80/jo.png" },

  // Group K
  { name: "Colombia 哥伦比亚", code: "COL", group: "K", flagUrl: "https://flagcdn.com/w80/co.png" },
  { name: "Portugal 葡萄牙", code: "POR", group: "K", flagUrl: "https://flagcdn.com/w80/pt.png" },
  { name: "Congo DR 刚果(金)", code: "COD", group: "K", flagUrl: "https://flagcdn.com/w80/cd.png" },
  { name: "Uzbekistan 乌兹别克斯坦", code: "UZB", group: "K", flagUrl: "https://flagcdn.com/w80/uz.png" },

  // Group L
  { name: "England 英格兰", code: "ENG", group: "L", flagUrl: "https://flagcdn.com/w80/gb-eng.png" },
  { name: "Croatia 克罗地亚", code: "CRO", group: "L", flagUrl: "https://flagcdn.com/w80/hr.png" },
  { name: "Ghana 加纳", code: "GHA", group: "L", flagUrl: "https://flagcdn.com/w80/gh.png" },
  { name: "Panama 巴拿马", code: "PAN", group: "L", flagUrl: "https://flagcdn.com/w80/pa.png" },
];

// 十二星座目录（第一部分：白羊~处女）。数据驱动，后续可任意增删。
// 每颗星：x/y 为 0-100 相对坐标；数组顺序 = 点亮顺序 = 连线顺序；facts 为分要点科普。
// silhouette 为官方星图式虚影（完成点亮后淡显），viewBox 0 0 100 100 的描边路径，线条穿过各星点。

import { requiredEnergyFor } from './energy'
import { CONSTELLATIONS_PART2 } from './constellations2'

export interface StarFact {
  label: string
  text: string
}

export interface ConstellationStar {
  id: string
  name: string
  nameEn: string
  massSolar: number // 太阳质量倍数，用于计算所需能量（对用户隐藏）
  x: number
  y: number
  facts: StarFact[]
}

export interface Constellation {
  id: string
  name: string
  symbol: string
  facts: StarFact[] // 星座介绍（分要点）
  silhouette: string
  stars: ConstellationStar[]
}

const CONSTELLATIONS_PART1: Constellation[] = [
  {
    id: 'aries',
    name: '白羊座',
    symbol: '♈',
    facts: [
      {
        label: '名字由来',
        text: '希腊神话中长着金羊毛的公羊。它驮着佛里克索斯与赫勒姐弟逃离危难，金羊毛后来成为伊阿宋远征的目标。',
      },
      {
        label: '神话',
        text: '公羊被献祭后，宙斯把它升上天空；金羊毛则悬挂在科尔基斯的圣林，引来无数英雄。',
      },
      {
        label: '形状',
        text: '夜空中由两段弯曲的线条构成羊角，主星娄宿三位于羊头，几颗暗星延伸成羊身。',
      },
      {
        label: '观测',
        text: '秋季夜晚最易观测。两千多年前春分点就在白羊座，如今因岁差已移至双鱼座。',
      },
    ],
    // 羊：头在娄宿三，角自头顶卷曲，身体沿娄宿二→天阴四→ε 延伸，前腿在娄宿一下方
    silhouette:
      '<path d="M26 40 C20 34 22 26 28 24 C32 28 30 34 30 40" /><path d="M30 44 C36 40 40 44 38 58 C44 64 50 66 62 70 C68 72 72 68 74 62" /><path d="M38 58 C44 62 52 64 58 62" /><path d="M34 52 L32 72 M44 62 L42 82 M54 66 L54 84 M68 68 L72 84" /><path d="M74 62 C78 58 80 56 82 54" />',
    stars: [
      {
        id: 'aries-1',
        name: '娄宿三',
        nameEn: 'Hamal',
        massSolar: 1.5,
        x: 30,
        y: 44,
        facts: [
          {
            label: '名字',
            text: '娄宿三：源于二十八宿之娄宿，象征聚众与牧养牺牲，位于黄道与白道交点附近。',
          },
          {
            label: '别名',
            text: 'Hamal，阿拉伯语"公羊的头"；又名 El Nath，意为"角"。弗兰斯蒂德编号白羊座 13。',
          },
          {
            label: '星体',
            text: 'K2III 型橙色巨星，体积约太阳的 14.7 倍，表面约 4400K，实际亮度为太阳的 90 倍。',
          },
          { label: '亮度', text: '视星等 2.00，绝对星等 0.47，夜空第 46 亮星，航海九星之一。' },
          { label: '位置', text: '距地球约 66 光年。' },
          {
            label: '文化',
            text: '分野属降娄（奎娄胃三宿），对应古代鲁地；形象为娄金狗，主司苑牧与祭祀。',
          },
          {
            label: '历史',
            text: '公元前 2000 至前 100 年，春分点位于白羊座，娄宿三因此是古代观测的重要标志；岁差已使春分点移入双鱼座。',
          },
        ],
      },
      {
        id: 'aries-2',
        name: '娄宿一',
        nameEn: 'Sheratan',
        massSolar: 2,
        x: 24,
        y: 56,
        facts: [
          {
            label: '名字',
            text: '娄宿一：娄宿第一星，与娄宿三同属二十八宿的娄宿。',
          },
          {
            label: '别名',
            text: 'Sheratan，阿拉伯语"两个标记"之一，指它与娄宿三这对羊角。',
          },
          { label: '星体', text: 'A 型白色双星系统，两星合计质量约太阳的 2 倍，绕转周期约 107 天。' },
          { label: '亮度', text: '视星等 2.64，白羊座第二亮星。' },
          { label: '位置', text: '距地球约 60 光年。' },
          {
            label: '历史',
            text: '两千多年前的春分点曾落在它附近，古代天文学家用它校准季节。',
          },
        ],
      },
      {
        id: 'aries-3',
        name: '娄宿二',
        nameEn: 'Mesarthim',
        massSolar: 2,
        x: 38,
        y: 58,
        facts: [
          {
            label: '名字',
            text: '娄宿二：娄宿第二星，羊角与羊身的连接处。',
          },
          { label: '别名', text: 'Mesarthim，希伯来语"仆人"，后指"献祭的公羊"。' },
          {
            label: '星体',
            text: 'A 型白色双星，两星亮度相近、相距约 7.5 角秒，是天文爱好者最爱的入门双星。',
          },
          { label: '亮度', text: '视星等约 3.9。' },
          { label: '位置', text: '距地球约 164 光年。' },
          {
            label: '历史',
            text: '1664 年胡克最早用望远镜确认的双星之一，是早期天文学的里程碑。',
          },
        ],
      },
      {
        id: 'aries-4',
        name: '天阴四',
        nameEn: 'Botein',
        massSolar: 2.5,
        x: 50,
        y: 66,
        facts: [
          {
            label: '名字',
            text: '天阴四：源于星官"天阴"，主司云雨阴晴。',
          },
          { label: '别名', text: 'Botein，阿拉伯语"小肚子"，指它在羊腹的位置。' },
          {
            label: '星体',
            text: 'K 型橙色巨星，已耗尽心部氢，膨胀到太阳直径的十余倍。',
          },
          { label: '亮度', text: '视星等约 4.4，肉眼可见但较暗。' },
          { label: '位置', text: '距地球约 168 光年。' },
          {
            label: '文化',
            text: '托勒密《天文学大成》（公元 2 世纪）已有记载，是西方最古老星表的一员。',
          },
        ],
      },
      {
        id: 'aries-5',
        name: '白羊座 ε',
        nameEn: 'ε Ari',
        massSolar: 2.5,
        x: 62,
        y: 70,
        facts: [
          {
            label: '名字',
            text: '白羊座 ε：没有专属中文名，以希腊字母编号，是羊身后部的一环。',
          },
          { label: '别名', text: '1603 年拜耳《测天图》以 ε 命名，沿用至今。' },
          {
            label: '星体',
            text: 'A 型白色双星，主星与伴星相距约 1.5 角秒，需高倍望远镜分辨。',
          },
          { label: '亮度', text: '视星等约 4.6。' },
          { label: '位置', text: '距地球约 290 光年。' },
          {
            label: '故事',
            text: '拜耳用希腊字母给全天恒星编号，ε 代表它在白羊座中亮度第五。',
          },
        ],
      },
      {
        id: 'aries-6',
        name: '胃宿三',
        nameEn: '41 Ari',
        massSolar: 3,
        x: 74,
        y: 62,
        facts: [
          {
            label: '名字',
            text: '胃宿三：源于二十八宿之胃宿，象征粮仓与五谷。',
          },
          { label: '别名', text: '以弗兰斯蒂德编号"白羊座 41"记载于 1712 年星表。' },
          {
            label: '星体',
            text: 'B 型蓝白色主序星，质量约太阳的 3 倍，表面温度超过一万度。',
          },
          { label: '亮度', text: '视星等约 3.6。' },
          { label: '位置', text: '距地球约 160 光年。' },
          {
            label: '文化',
            text: '分野属大梁（胃昴毕三宿），对应古代赵地；胃宿主司仓廪，与秋收相关。',
          },
        ],
      },
    ],
  },
  {
    id: 'taurus',
    name: '金牛座',
    symbol: '♉',
    facts: [
      {
        label: '名字由来',
        text: '宙斯化身而成的白色公牛，他把腓尼基公主欧罗巴驮过大海——欧洲之名即源于她。',
      },
      {
        label: '神话',
        text: '也有说法是克里特的公牛，赫拉克勒斯第七项试炼的对手，最终被献祭升天。',
      },
      {
        label: '形状',
        text: '主星组成一个明显的 V 字牛面：毕宿五是牛眼，两颗角尖直指天顶；旁边还有昴星团与蟹状星云。',
      },
      {
        label: '观测',
        text: '冬季夜晚最壮观的星座之一；1054 年的"天关客星"超新星就爆发在这里，留下蟹状星云。',
      },
    ],
    // 牛：面向右，角尖在五车五与天关星，V 字脸由毕宿一/毕宿五/毕宿三/毕宿四构成，身体向左
    silhouette:
      '<path d="M42 52 C40 40 36 34 32 28 M50 50 C56 40 60 34 62 30" /><path d="M42 52 C46 46 52 46 55 48 C60 52 58 58 58 58 C56 64 50 68 48 68 C44 66 42 60 42 52" /><path d="M42 60 C32 64 26 70 26 78 C26 84 30 86 34 84 L34 74 M26 78 C24 84 22 88 22 92 M34 78 C36 84 38 88 38 92" /><path d="M58 62 C68 66 74 70 76 78 C76 84 72 86 68 84 L68 74" /><path d="M48 68 C46 78 44 86 42 92" />',
    stars: [
      {
        id: 'tau-1',
        name: '毕宿五',
        nameEn: 'Aldebaran',
        massSolar: 1.5,
        x: 50,
        y: 55,
        facts: [
          {
            label: '名字',
            text: '毕宿五：源于二十八宿之毕宿，象征捕猎的网与雨师。',
          },
          {
            label: '别名',
            text: 'Aldebaran，阿拉伯语"追随者"——它总是追着昴星团升起。',
          },
          {
            label: '星体',
            text: 'K5III 型橙色巨星，体积约太阳的 44 倍，表面约 3900K，实际亮度为太阳的 400 倍。',
          },
          {
            label: '亮度',
            text: '视星等 0.87，夜空第 14 亮星，全天四大航海星之一。',
          },
          { label: '位置', text: '距地球约 65 光年。' },
          {
            label: '文化',
            text: '分野属大梁（胃昴毕），对应古代赵地；毕宿八星形如毕网，主司田猎。',
          },
        ],
      },
      {
        id: 'tau-2',
        name: '五车五',
        nameEn: 'Elnath',
        massSolar: 4.5,
        x: 32,
        y: 28,
        facts: [
          {
            label: '名字',
            text: '五车五：源于星官"五车"，象征五帝的车驾。',
          },
          {
            label: '别名',
            text: 'Elnath，阿拉伯语"抵角"，即牛用角顶撞之处。',
          },
          {
            label: '星体',
            text: 'B7III 型蓝白巨星，质量约太阳的 4.5 倍，表面约一万三千度。',
          },
          { label: '亮度', text: '视星等 1.65，夜空第 26 亮星。' },
          { label: '位置', text: '距地球约 134 光年。' },
          {
            label: '文化',
            text: '几千年间星座边界数次改划，它始终站在金牛与御夫之间，同时被两个星座引用。',
          },
        ],
      },
      {
        id: 'tau-3',
        name: '天关星',
        nameEn: 'ζ Tau',
        massSolar: 11,
        x: 62,
        y: 30,
        facts: [
          {
            label: '名字',
            text: '天关星：星官"天关"，黄道上的关卡，日、月、五星由此经过。',
          },
          { label: '别名', text: 'ζ Tau，西方无专名，因靠近蟹状星云而闻名。' },
          {
            label: '星体',
            text: 'B 型蓝白巨星，质量约太阳的 11 倍，表面约两万两千度。',
          },
          { label: '亮度', text: '视星等约 3.0。' },
          { label: '位置', text: '距地球约 440 光年。' },
          {
            label: '历史',
            text: '1054 年，就在它旁边爆发了著名的"天关客星"——宋人记载其昼见二十三日，遗迹即蟹状星云。',
          },
        ],
      },
      {
        id: 'tau-4',
        name: '毕宿八',
        nameEn: 'λ Tau',
        massSolar: 7,
        x: 55,
        y: 48,
        facts: [
          {
            label: '名字',
            text: '毕宿八：毕宿第八星，在 V 字牛面的上缘。',
          },
          { label: '别名', text: 'λ Tau，无专名，是变星研究的经典目标。' },
          {
            label: '星体',
            text: 'B 型蓝白星组成的三合星系统，主星质量约太阳的 7 倍。',
          },
          {
            label: '亮度',
            text: '视星等 3.4，每 3.95 天周期性变暗——一颗星挡住了另一颗。',
          },
          { label: '位置', text: '距地球约 480 光年。' },
          {
            label: '历史',
            text: '1784 年古德里克发现它是食双星，是最早被确认的"变星"之一。',
          },
        ],
      },
      {
        id: 'tau-5',
        name: '毕宿一',
        nameEn: 'ε Tau',
        massSolar: 2.5,
        x: 42,
        y: 52,
        facts: [
          {
            label: '名字',
            text: '毕宿一：毕宿第一星，V 字牛面的左角根。',
          },
          { label: '别名', text: 'ε Tau，无专名，属毕宿星团。' },
          {
            label: '星体',
            text: 'K 型橙色巨星，质量约太阳的 2.5 倍，是毕宿星团最亮的成员。',
          },
          { label: '亮度', text: '视星等约 3.5。' },
          { label: '位置', text: '距地球约 147 光年。' },
          {
            label: '故事',
            text: '2007 年天文学家发现它身边有一颗比木星更重的行星环绕。',
          },
        ],
      },
      {
        id: 'tau-6',
        name: '毕宿三',
        nameEn: 'δ Tau',
        massSolar: 2.5,
        x: 58,
        y: 58,
        facts: [
          {
            label: '名字',
            text: '毕宿三：毕宿第三星，V 字牛面的右角根。',
          },
          { label: '别名', text: 'δ Tau，无专名，毕宿星团成员。' },
          {
            label: '星体',
            text: 'K 型橙色巨星，与太阳同龄的前辈，正走向红巨星阶段。',
          },
          { label: '亮度', text: '视星等约 3.8。' },
          { label: '位置', text: '距地球约 159 光年。' },
          {
            label: '故事',
            text: '毕宿星团是一群约 6 亿年前一起诞生的恒星兄弟，至今仍结伴而行。',
          },
        ],
      },
      {
        id: 'tau-7',
        name: '毕宿四',
        nameEn: 'γ Tau',
        massSolar: 2.5,
        x: 48,
        y: 68,
        facts: [
          {
            label: '名字',
            text: '毕宿四：毕宿第四星，V 字牛面的下尖。',
          },
          { label: '别名', text: 'γ Tau，无专名，毕宿星团成员。' },
          {
            label: '星体',
            text: 'K 型橙色巨星，质量约太阳的 2.5 倍，亮度为太阳的 80 倍。',
          },
          { label: '亮度', text: '视星等约 3.65。' },
          { label: '位置', text: '距地球约 154 光年。' },
          {
            label: '文化',
            text: '毕宿八星在古中国主司雨师，古人相信毕宿明亮则多雨。',
          },
        ],
      },
    ],
  },
  {
    id: 'gemini',
    name: '双子座',
    symbol: '♊',
    facts: [
      {
        label: '名字由来',
        text: '卡斯托尔与波吕克斯——一对同母异父的兄弟，一个凡人、一个神明。',
      },
      {
        label: '神话',
        text: '卡斯托尔战死后，波吕克斯求宙斯以自己的永生换兄弟复活；宙斯让他们轮流居于天界与冥界，成为双子座。',
      },
      {
        label: '形状',
        text: '两条几乎平行的人形线条：北河二与北河三是兄弟的头，星线向下延伸成身体与腿。',
      },
      {
        label: '观测',
        text: '冬季夜晚高悬天顶；每年 12 月的双子座流星雨辐射点就在这里。',
      },
    ],
    // 兄弟二人：头在北河二/井宿一，身体沿北河三/井宿五下伸，井宿三与钺为两人的脚
    silhouette:
      '<path d="M34 30 C30 26 30 22 34 22 C38 22 38 26 34 30" /><path d="M34 36 L40 50 L44 60 L48 70" /><path d="M40 46 C46 44 52 44 56 46" /><path d="M44 58 L40 78 M46 58 L52 76" /><path d="M58 44 C54 40 54 36 58 36 C62 36 62 40 58 44" /><path d="M58 50 L62 60 L66 66" /><path d="M62 58 C66 62 70 66 74 75" /><path d="M64 62 L58 78" />',
    stars: [
      {
        id: 'gem-1',
        name: '北河二',
        nameEn: 'Castor',
        massSolar: 2.5,
        x: 34,
        y: 30,
        facts: [
          {
            label: '名字',
            text: '北河二：星官"南北河"，古人以黄河为天汉分野，南北河戍守其间。',
          },
          {
            label: '别名',
            text: 'Castor，卡斯托尔，兄弟中的凡人；1678 年卡西尼发现它是双星。',
          },
          {
            label: '星体',
            text: '肉眼看是一颗，实为六颗星组成的系统：三对双星互相绕转。',
          },
          { label: '亮度', text: '视星等 1.58，夜空第 23 亮星。' },
          { label: '位置', text: '距地球约 51 光年。' },
          {
            label: '故事',
            text: '兄弟的象征再贴切不过——看起来一体，其实是纠缠的群星。',
          },
        ],
      },
      {
        id: 'gem-2',
        name: '北河三',
        nameEn: 'Pollux',
        massSolar: 1.9,
        x: 40,
        y: 50,
        facts: [
          {
            label: '名字',
            text: '北河三：南北河星官之一，镇守天汉（银河）北岸。',
          },
          {
            label: '别名',
            text: 'Pollux，波吕克斯，兄弟中的神明；也因此比北河二稍亮。',
          },
          {
            label: '星体',
            text: 'K0III 型橙色巨星，体积约太阳的 9 倍，表面约 4700K。',
          },
          {
            label: '亮度',
            text: '视星等 1.14，夜空第 17 亮星，双子座最亮。',
          },
          { label: '位置', text: '距地球约 34 光年，是距我们最近的巨星之一。' },
          {
            label: '故事',
            text: '2006 年发现它有一颗约木星 2 倍质量的行星，被称为"波吕克斯 b"。',
          },
        ],
      },
      {
        id: 'gem-3',
        name: '井宿三',
        nameEn: 'Alhena',
        massSolar: 2.8,
        x: 48,
        y: 70,
        facts: [
          {
            label: '名字',
            text: '井宿三：源于二十八宿之井宿，形如井字，主司水事。',
          },
          {
            label: '别名',
            text: 'Alhena，阿拉伯语"骆驼颈上的烙印"。',
          },
          {
            label: '星体',
            text: 'A 型白色次巨星，质量约太阳的 2.8 倍，表面约九千度。',
          },
          { label: '亮度', text: '视星等 1.93，双子座第三亮。' },
          { label: '位置', text: '距地球约 109 光年。' },
          {
            label: '文化',
            text: '分野属鹑首（井鬼二宿），对应古代秦地。',
          },
        ],
      },
      {
        id: 'gem-4',
        name: '井宿一',
        nameEn: 'μ Gem',
        massSolar: 2,
        x: 58,
        y: 44,
        facts: [
          {
            label: '名字',
            text: '井宿一：井宿第一星，兄弟右肩的位置。',
          },
          { label: '别名', text: 'μ Gem，无专名。' },
          {
            label: '星体',
            text: 'M 型红巨星，体积已膨胀到太阳的 90 倍左右，正走向生命末期。',
          },
          { label: '亮度', text: '视星等约 2.9，呈明显的红色。' },
          { label: '位置', text: '距地球约 230 光年。' },
          {
            label: '故事',
            text: '它是少数肉眼可见的红巨星之一，望远镜里像一颗暗红的炭火。',
          },
        ],
      },
      {
        id: 'gem-5',
        name: '井宿五',
        nameEn: 'ε Gem',
        massSolar: 7,
        x: 66,
        y: 60,
        facts: [
          {
            label: '名字',
            text: '井宿五：井宿第五星，兄弟伸出的那条腿。',
          },
          { label: '别名', text: 'ε Gem，无专名。' },
          {
            label: '星体',
            text: 'G 型黄超巨星，质量约太阳的 7 倍，直径约为太阳的 100 倍。',
          },
          { label: '亮度', text: '视星等约 3.06。' },
          { label: '位置', text: '距地球约 845 光年。' },
          {
            label: '故事',
            text: '隔着八百多光年，它是双子座里最遥远的主星。',
          },
        ],
      },
      {
        id: 'gem-6',
        name: '钺',
        nameEn: 'δ Gem',
        massSolar: 1.7,
        x: 74,
        y: 75,
        facts: [
          {
            label: '名字',
            text: '钺：古代兵器名，这片天区被古人看作兵械之架。',
          },
          { label: '别名', text: 'δ Gem，无专名。' },
          {
            label: '星体',
            text: 'F 型黄白次巨星，质量约太阳的 1.7 倍。',
          },
          { label: '亮度', text: '视星等约 3.5。' },
          { label: '位置', text: '距地球约 60 光年。' },
          {
            label: '故事',
            text: '一柄悬在天上的钺，静静守着兄弟俩的脚边。',
          },
        ],
      },
    ],
  },
  {
    id: 'cancer',
    name: '巨蟹座',
    symbol: '♋',
    facts: [
      {
        label: '名字由来',
        text: '赫拉派去干扰赫拉克勒斯的大螃蟹。英雄与九头蛇搏斗时，它从沼泽爬出钳住他的脚。',
      },
      {
        label: '神话',
        text: '螃蟹被一脚踩碎，赫拉怜其忠诚，把它升上天空，成为巨蟹座。',
      },
      {
        label: '形状',
        text: '黄道十二宫中最黯淡的星座，星点散落如倒写的 Y，中间藏着著名的蜂巢星团。',
      },
      {
        label: '观测',
        text: '春末夜晚可见；蜂巢星团（M44）肉眼如一团雾气，古人称"积尸气"。',
      },
    ],
    // 蟹：椭圆蟹身包住中央星点，双螯伸向柳宿增三与鬼宿四，腿向下方散开
    silhouette:
      '<path d="M36 48 C36 56 64 56 64 48 C64 42 56 38 50 38 C44 38 36 42 36 48" /><path d="M40 38 C36 30 32 28 28 32 C32 30 36 32 34 36" /><path d="M58 36 C64 28 70 26 74 30 C70 28 66 32 64 36" /><path d="M42 54 L36 64 M50 56 L52 66 M60 54 L64 64 M46 56 L45 72" />',
    stars: [
      {
        id: 'cnc-1',
        name: '柳宿增三',
        nameEn: 'β Cnc',
        massSolar: 1.7,
        x: 40,
        y: 38,
        facts: [
          {
            label: '名字',
            text: '柳宿增三：柳宿的增星。柳宿主司草木，是南方朱雀的喙。',
          },
          {
            label: '别名',
            text: 'Altarf，阿拉伯语"末端"，指蟹螯的尖端。',
          },
          {
            label: '星体',
            text: 'K4III 型橙色巨星，体积约太阳的 40 倍，是巨蟹座最亮星。',
          },
          { label: '亮度', text: '视星等约 3.5。' },
          { label: '位置', text: '距地球约 290 光年。' },
          {
            label: '文化',
            text: '分野属鹑火（柳星张三宿），对应古代周地。',
          },
        ],
      },
      {
        id: 'cnc-2',
        name: '鬼宿四',
        nameEn: 'δ Cnc',
        massSolar: 1.5,
        x: 58,
        y: 32,
        facts: [
          {
            label: '名字',
            text: '鬼宿四：源于二十八宿之鬼宿，主司祠祀与占卜。',
          },
          { label: '别名', text: 'Asellus Australis，拉丁语"南边的驴"。' },
          {
            label: '星体',
            text: 'K 型橙色巨星，质量约太阳的 1.5 倍。',
          },
          { label: '亮度', text: '视星等约 3.94。' },
          { label: '位置', text: '距地球约 131 光年。' },
          {
            label: '故事',
            text: '它与鬼宿三并称"两头驴"，中间的蜂巢星团是它们的"马槽"。',
          },
        ],
      },
      {
        id: 'cnc-3',
        name: '轩辕增廿二',
        nameEn: 'ι Cnc',
        massSolar: 3.5,
        x: 50,
        y: 50,
        facts: [
          {
            label: '名字',
            text: '轩辕增廿二：被编入"轩辕"星官的远支——星官体系与西方星座的错位。',
          },
          { label: '别名', text: 'ι Cnc，无专名。' },
          {
            label: '星体',
            text: 'G 型黄超巨星，直径约太阳的 60 倍，实际亮度是太阳的 800 倍。',
          },
          { label: '亮度', text: '视星等约 4.03。' },
          { label: '位置', text: '距地球约 330 光年。' },
          {
            label: '故事',
            text: '一颗远在蟹壳中央的巨星，肉眼看去却只是暗点。',
          },
        ],
      },
      {
        id: 'cnc-4',
        name: '鬼宿三',
        nameEn: 'γ Cnc',
        massSolar: 2.5,
        x: 60,
        y: 48,
        facts: [
          {
            label: '名字',
            text: '鬼宿三：鬼宿第三星，与鬼宿四相对。',
          },
          { label: '别名', text: 'Asellus Borealis，拉丁语"北边的驴"。' },
          {
            label: '星体',
            text: 'A 型白色次巨星，质量约太阳的 2.5 倍。',
          },
          { label: '亮度', text: '视星等约 4.66。' },
          { label: '位置', text: '距地球约 181 光年。' },
          {
            label: '故事',
            text: '公元前 1 世纪，木星与土星曾在这附近相合——有学者认为即"伯利恒之星"。',
          },
        ],
      },
      {
        id: 'cnc-5',
        name: '柳宿增十',
        nameEn: 'α Cnc',
        massSolar: 2,
        x: 52,
        y: 62,
        facts: [
          {
            label: '名字',
            text: '柳宿增十：柳宿的增星，蟹身下缘。',
          },
          {
            label: '别名',
            text: 'Acubens，阿拉伯语"钳子"，即螃蟹前伸的那只螯。',
          },
          {
            label: '星体',
            text: 'A 型白色恒星，质量约太阳的 2 倍。',
          },
          { label: '亮度', text: '视星等约 4.26。' },
          { label: '位置', text: '距地球约 174 光年。' },
          {
            label: '文化',
            text: '古中国将鬼宿四星看作朱雀之目，主司鬼祠。',
          },
        ],
      },
      {
        id: 'cnc-6',
        name: '轩辕增十九',
        nameEn: '55 Cnc',
        massSolar: 0.95,
        x: 45,
        y: 72,
        facts: [
          {
            label: '名字',
            text: '轩辕增十九：编入"轩辕"星官，是巨蟹座最不起眼的星之一。',
          },
          { label: '别名', text: '55 Cancri，以弗兰斯蒂德编号命名。' },
          {
            label: '星体',
            text: 'G 型黄矮星，与太阳同类型，质量约为太阳的 0.95 倍。',
          },
          {
            label: '亮度',
            text: '视星等 5.95，肉眼勉强可见——却是全天最著名的恒星之一。',
          },
          { label: '位置', text: '距地球约 41 光年。' },
          {
            label: '故事',
            text: '1997 年起陆续确认至少五颗行星环绕，被称为"另一个太阳系"。',
          },
        ],
      },
    ],
  },
  {
    id: 'leo',
    name: '狮子座',
    symbol: '♌',
    facts: [
      {
        label: '名字由来',
        text: '涅墨亚的巨狮——皮毛刀枪不入的怪兽，赫拉克勒斯十二试炼的第一项。',
      },
      {
        label: '神话',
        text: '赫拉克勒斯徒手扼死巨狮，剥下狮皮披在身上；宙斯把狮子升上天空。',
      },
      {
        label: '形状',
        text: '镰刀形的狮首与尾部三角清晰可辨：轩辕十四是狮心，五帝座一是狮尾。',
      },
      {
        label: '观测',
        text: '春季夜晚的主角；每年 11 月的狮子座流星雨辐射点位于镰刀附近。',
      },
    ],
    // 狮：头在镰刀顶端，鬃毛沿轩辕八→轩辕十→轩辕九→轩辕十二垂下，前胸至轩辕十四，背沿西上相至五帝座一（尾）
    silhouette:
      '<path d="M29 14 C25 16 22 20 24 26 C20 30 20 36 24 40 C22 46 24 50 28 52" /><path d="M28 52 C30 58 30 64 30 72" /><path d="M28 22 C34 26 40 30 46 36 C50 40 48 46 44 52 C40 58 34 64 30 70" /><path d="M44 52 C52 54 58 54 60 50 C68 58 74 64 76 68 C80 72 78 78 74 78" /><path d="M50 56 L48 78 M58 56 L60 80" />',
    stars: [
      {
        id: 'leo-1',
        name: '轩辕十四',
        nameEn: 'Regulus',
        massSolar: 3.8,
        x: 30,
        y: 72,
        facts: [
          {
            label: '名字',
            text: '轩辕十四：源于星官"轩辕"，黄帝的名号，十七星横贯狮子与巨蟹。',
          },
          {
            label: '别名',
            text: 'Regulus，拉丁语"小国王"；古波斯四颗"王者之星"之一。',
          },
          {
            label: '星体',
            text: 'B8IV 型蓝白星，质量约太阳的 3.8 倍，表面约一万两千度，自转极快。',
          },
          {
            label: '亮度',
            text: '视星等 1.35，夜空第 21 亮星，航海星之一。',
          },
          { label: '位置', text: '距地球约 79 光年。' },
          {
            label: '历史',
            text: '几乎正落在黄道上，月亮与行星常从它身边掠过——古代的"王星"。',
          },
        ],
      },
      {
        id: 'leo-2',
        name: '轩辕十三',
        nameEn: 'η Leo',
        massSolar: 7,
        x: 32,
        y: 58,
        facts: [
          {
            label: '名字',
            text: '轩辕十三：轩辕星官一员，镰刀柄上的远星。',
          },
          { label: '别名', text: 'η Leo，无专名。' },
          {
            label: '星体',
            text: 'A 型白色超巨星，质量约太阳的 7 倍，实际亮度是太阳的 20000 倍。',
          },
          { label: '亮度', text: '视星等约 3.5。' },
          { label: '位置', text: '距地球约 1300 光年，狮子座最遥远的主星。' },
          {
            label: '故事',
            text: '隔着千余光年与轩辕十四相望，是镰刀柄上最远的一颗。',
          },
        ],
      },
      {
        id: 'leo-3',
        name: '轩辕十二',
        nameEn: 'Algieba',
        massSolar: 2.5,
        x: 44,
        y: 48,
        facts: [
          {
            label: '名字',
            text: '轩辕十二：轩辕星官一员，镰刀弧线正中。',
          },
          {
            label: '别名',
            text: 'Algieba，阿拉伯语"狮子的鬃毛"。',
          },
          {
            label: '星体',
            text: 'K 型橙色巨星与 G 型巨星组成的双星，绕转周期约 620 年。',
          },
          { label: '亮度', text: '视星等约 2.0。' },
          { label: '位置', text: '距地球约 130 光年。' },
          {
            label: '历史',
            text: '1782 年赫歇尔发现它是双星；2009 年发现其中一颗巨行星。',
          },
        ],
      },
      {
        id: 'leo-4',
        name: '轩辕九',
        nameEn: 'Adhafera',
        massSolar: 2.2,
        x: 46,
        y: 36,
        facts: [
          {
            label: '名字',
            text: '轩辕九：轩辕星官一员，鬃毛与镰刀之间。',
          },
          { label: '别名', text: 'Adhafera，阿拉伯语"发卷"，指狮鬃。' },
          {
            label: '星体',
            text: 'F 型黄白巨星，质量约太阳的 2.2 倍。',
          },
          { label: '亮度', text: '视星等约 3.4。' },
          { label: '位置', text: '距地球约 274 光年。' },
          {
            label: '故事',
            text: '古中国把整个镰刀编入"轩辕"，想象黄帝的车驾横过天穹。',
          },
        ],
      },
      {
        id: 'leo-5',
        name: '轩辕十',
        nameEn: 'Rasalas',
        massSolar: 1.5,
        x: 38,
        y: 25,
        facts: [
          {
            label: '名字',
            text: '轩辕十：轩辕星官一员，镰刀顶端。',
          },
          {
            label: '别名',
            text: 'Rasalas，阿拉伯语"狮子头北侧"。',
          },
          {
            label: '星体',
            text: 'K 型橙色巨星，质量约太阳的 1.5 倍。',
          },
          { label: '亮度', text: '视星等约 3.9。' },
          { label: '位置', text: '距地球约 124 光年。' },
          {
            label: '故事',
            text: '镰刀的最高点，像狮子抬起的额头。',
          },
        ],
      },
      {
        id: 'leo-6',
        name: '轩辕八',
        nameEn: 'ε Leo',
        massSolar: 2,
        x: 29,
        y: 14,
        facts: [
          {
            label: '名字',
            text: '轩辕八：轩辕星官一员，镰刀最顶端。',
          },
          { label: '别名', text: 'ε Leo，无专名。' },
          {
            label: '星体',
            text: 'G 型黄巨星，质量约太阳的 2 倍。',
          },
          { label: '亮度', text: '视星等约 2.97。' },
          { label: '位置', text: '距地球约 247 光年。' },
          {
            label: '故事',
            text: '划过天际的镰刀弧线在这里收住，像狮子的耳尖。',
          },
        ],
      },
      {
        id: 'leo-7',
        name: '西上相',
        nameEn: 'Zosma',
        massSolar: 2.2,
        x: 60,
        y: 50,
        facts: [
          {
            label: '名字',
            text: '西上相：太微垣西垣的星官，"上相"为天子的重臣。',
          },
          {
            label: '别名',
            text: 'Zosma，希腊语"腰带"，横在狮背。',
          },
          {
            label: '星体',
            text: 'A 型白色主序星，质量约太阳的 2.2 倍。',
          },
          { label: '亮度', text: '视星等约 2.56。' },
          { label: '位置', text: '距地球约 58 光年。' },
          {
            label: '故事',
            text: '连起镰刀与尾部三角，是狮子座前后两半的枢纽。',
          },
        ],
      },
      {
        id: 'leo-8',
        name: '五帝座一',
        nameEn: 'Denebola',
        massSolar: 1.8,
        x: 76,
        y: 68,
        facts: [
          {
            label: '名字',
            text: '五帝座一：星官"五帝座"，五方天帝的御座。',
          },
          {
            label: '别名',
            text: 'Denebola，阿拉伯语"狮子的尾巴"。',
          },
          {
            label: '星体',
            text: 'A3 型白色主序星，质量约太阳的 1.8 倍，表面约 8500K。',
          },
          { label: '亮度', text: '视星等 2.14，航海星之一。' },
          { label: '位置', text: '距地球约 36 光年。' },
          {
            label: '故事',
            text: '与轩辕十四、大角、角宿一组成"春季大三角"，是春季认星的钥匙。',
          },
        ],
      },
    ],
  },
  {
    id: 'virgo',
    name: '处女座',
    symbol: '♍',
    facts: [
      {
        label: '名字由来',
        text: '常被看作正义女神阿斯特赖亚或丰收女神，手持麦穗——角宿一的拉丁名正是"麦穗"。',
      },
      {
        label: '神话',
        text: '传说人类从黄金时代堕落时，正义女神是最后离开人间的神，她的化身就是处女座。',
      },
      {
        label: '形状',
        text: '黄道上最大的星座：一个斜倚的人形，角宿一是她手中的麦穗。',
      },
      {
        label: '观测',
        text: '春季夜晚可见；附近聚集着室女座星系团——上千个星系挤在同一片天空。',
      },
    ],
    // 少女：头在右执法，肩在东次将，裙摆沿亢宿四展开，右臂伸向角宿一（麦穗）
    silhouette:
      '<path d="M44 30 C40 26 40 22 44 22 C48 22 48 26 44 30" /><path d="M44 36 L48 44 L50 52" /><path d="M46 42 C52 44 58 46 62 56 C64 62 62 68 62 72" /><path d="M62 56 L66 62 M62 64 L68 64 M62 70 L66 76" /><path d="M50 52 L40 78 L64 78 L56 52" />',
    stars: [
      {
        id: 'vir-1',
        name: '角宿一',
        nameEn: 'Spica',
        massSolar: 11,
        x: 62,
        y: 72,
        facts: [
          {
            label: '名字',
            text: '角宿一：二十八宿之首"角宿"的主星，苍龙之角。',
          },
          {
            label: '别名',
            text: 'Spica，拉丁语"麦穗"——女神手中的谷穗。',
          },
          {
            label: '星体',
            text: 'B1 型蓝白巨星双星，主星质量约太阳的 11 倍，表面约 22000K，实际亮度为太阳的两万倍。',
          },
          {
            label: '亮度',
            text: '视星等 0.97，夜空第 16 亮星，航海星之一。',
          },
          { label: '位置', text: '距地球约 250 光年。' },
          {
            label: '历史',
            text: '公元前 2 世纪，喜帕恰斯正是靠它附近的记录发现了岁差。',
          },
        ],
      },
      {
        id: 'vir-2',
        name: '东次将',
        nameEn: 'Porrima',
        massSolar: 2.5,
        x: 40,
        y: 42,
        facts: [
          {
            label: '名字',
            text: '东次将：太微垣的武官星官，位列"上将"之下。',
          },
          {
            label: '别名',
            text: 'Porrima，罗马的预言女神，也是生育之神。',
          },
          {
            label: '星体',
            text: '一对几乎一模一样的 F 型黄白孪生恒星，绕转周期 169 年。',
          },
          { label: '亮度', text: '视星等 2.74。' },
          { label: '位置', text: '距地球约 38 光年。' },
          {
            label: '历史',
            text: '1718 年布拉德雷发现它是双星；每 169 年才能看它"分开"一次。',
          },
        ],
      },
      {
        id: 'vir-3',
        name: '右执法',
        nameEn: 'Zavijava',
        massSolar: 1.1,
        x: 44,
        y: 30,
        facts: [
          {
            label: '名字',
            text: '右执法：太微垣"执法"星官之一，掌刑罚的星。',
          },
          {
            label: '别名',
            text: 'Zavijava，阿拉伯语"犬舍的一角"。',
          },
          {
            label: '星体',
            text: 'F 型黄白星，与太阳十分相似，质量约为太阳的 1.1 倍。',
          },
          { label: '亮度', text: '视星等约 3.6。' },
          { label: '位置', text: '距地球约 36 光年。' },
          {
            label: '历史',
            text: '1919 年日全食，爱丁顿借它验证了广义相对论的光线弯曲。',
          },
        ],
      },
      {
        id: 'vir-4',
        name: '亢宿四',
        nameEn: 'δ Vir',
        massSolar: 1.5,
        x: 50,
        y: 58,
        facts: [
          {
            label: '名字',
            text: '亢宿四：源于二十八宿之亢宿，苍龙的脖颈。',
          },
          { label: '别名', text: 'δ Vir，无专名。' },
          {
            label: '星体',
            text: 'M 型红巨星，体积约太阳的 65 倍，正膨胀走向生命末期。',
          },
          { label: '亮度', text: '视星等约 3.38。' },
          { label: '位置', text: '距地球约 198 光年。' },
          {
            label: '文化',
            text: '分野属寿星（角亢二宿），对应古代郑地。',
          },
        ],
      },
      {
        id: 'vir-5',
        name: '角宿二',
        nameEn: 'ζ Vir',
        massSolar: 2.2,
        x: 68,
        y: 55,
        facts: [
          {
            label: '名字',
            text: '角宿二：角宿第二星，与角宿一构成苍龙的双角。',
          },
          { label: '别名', text: 'ζ Vir，无专名。' },
          {
            label: '星体',
            text: 'A 型白色主序星，质量约太阳的 2.2 倍。',
          },
          { label: '亮度', text: '视星等约 3.37。' },
          { label: '位置', text: '距地球约 74 光年。' },
          {
            label: '故事',
            text: '两颗"角"标定了中国古代的秋分点，是历法的基准星。',
          },
        ],
      },
      {
        id: 'vir-6',
        name: '东上相',
        nameEn: 'Vindemiatrix',
        massSolar: 2.6,
        x: 58,
        y: 38,
        facts: [
          {
            label: '名字',
            text: '东上相：太微垣的文官星官，天子的辅臣。',
          },
          {
            label: '别名',
            text: 'Vindemiatrix，拉丁语"采葡萄者"。',
          },
          {
            label: '星体',
            text: 'G 型黄巨星，质量约太阳的 2.6 倍。',
          },
          { label: '亮度', text: '视星等约 2.83。' },
          { label: '位置', text: '距地球约 110 光年。' },
          {
            label: '故事',
            text: '它清晨升起时，古罗马人就知道：该收葡萄了。',
          },
        ],
      },
    ],
  },
]

export const CONSTELLATIONS: Constellation[] = [...CONSTELLATIONS_PART1, ...CONSTELLATIONS_PART2]

export function getConstellation(id: string): Constellation | undefined {
  return CONSTELLATIONS.find((c) => c.id === id)
}

export function findConstellationStar(constellationId: string, starId: string): ConstellationStar | null {
  const c = getConstellation(constellationId)
  return c?.stars.find((s) => s.id === starId) ?? null
}

export interface StarEnergy {
  energy: number
  required: number
}

export interface ConstellationProgress {
  lit: number // 完全点亮
  partial: number // 点亮中（弦月态）
  total: number
  remaining: number // 还差多少能量（对用户隐藏）
  percent: number // 已点亮百分比（展示用）
  next: ConstellationStar | null
  complete: boolean
}

export function progressOf(c: Constellation, energies: ReadonlyMap<string, StarEnergy>): ConstellationProgress {
  let lit = 0
  let partial = 0
  let remaining = 0
  let next: ConstellationStar | null = null
  let totalRequired = 0
  for (const s of c.stars) totalRequired += requiredEnergyFor(s.massSolar)
  for (const s of c.stars) {
    const e = energies.get(s.id)
    if (!e) {
      remaining += requiredEnergyFor(s.massSolar)
      if (!next) next = s
      continue
    }
    if (e.energy >= e.required) lit++
    else {
      partial++
      remaining += e.required - e.energy
      if (!next) next = s
    }
  }
  const earned = totalRequired - remaining
  return {
    lit,
    partial,
    total: c.stars.length,
    remaining,
    percent: totalRequired > 0 ? Math.floor((earned / totalRequired) * 100) : 0,
    next,
    complete: next === null,
  }
}

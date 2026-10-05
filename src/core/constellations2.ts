// 十二星座目录（第二部分：天秤~双鱼）。类型定义见 constellations.ts。

import type { Constellation } from './constellations'

export const CONSTELLATIONS_PART2: Constellation[] = [
  {
    id: 'libra',
    name: '天秤座',
    symbol: '♎',
    facts: [
      {
        label: '名字由来',
        text: '正义女神阿斯特赖亚手中的天平——黄道十二宫中唯一以器物命名的星座。',
      },
      {
        label: '神话',
        text: '传说女神用天平称量人间善恶；也有一说它是邻近处女座女神手中的量器。',
      },
      {
        label: '形状',
        text: '四颗主星构成菱形，上下如两枚秤盘；两千年前秋分点正落在这里，昼夜等长。',
      },
      {
        label: '观测',
        text: '春末夏初可见；它原是天蝎座的双螯，罗马人把它单独划为天平。',
      },
    ],
    // 天平：横梁在氐宿四与折威七之间，中心支柱下垂至折威五，两盘在氐宿一与氐宿三
    silhouette:
      '<path d="M44 38 L58 40" /><path d="M51 40 L52 66" /><path d="M46 39 L38 50 M56 40 L62 54" /><path d="M32 50 C32 58 44 58 44 50" /><path d="M56 54 C56 62 68 62 68 54" />',
    stars: [
      {
        id: 'lib-1',
        name: '氐宿一',
        nameEn: 'Zubenelgenubi',
        massSolar: 2.8,
        x: 38,
        y: 50,
        facts: [
          {
            label: '名字',
            text: '氐宿一：源于二十八宿之氐宿，苍龙的胸腹。',
          },
          {
            label: '别名',
            text: 'Zubenelgenubi，阿拉伯语"南边的钳子"——它原是天蝎的螯。',
          },
          {
            label: '星体',
            text: 'A 型白色双星，主星质量约太阳的 2.8 倍。',
          },
          { label: '亮度', text: '视星等约 2.75，航海星之一。' },
          { label: '位置', text: '距地球约 77 光年。' },
          {
            label: '文化',
            text: '分野属大火（氐房心三宿），对应古代宋地。',
          },
        ],
      },
      {
        id: 'lib-2',
        name: '氐宿四',
        nameEn: 'Zubeneschamali',
        massSolar: 3.5,
        x: 44,
        y: 38,
        facts: [
          {
            label: '名字',
            text: '氐宿四：氐宿第四星，天平横梁的左端。',
          },
          {
            label: '别名',
            text: 'Zubeneschamali，阿拉伯语"北边的钳子"。',
          },
          {
            label: '星体',
            text: 'B8 型蓝白星，质量约太阳的 3.5 倍，表面约一万两千度。',
          },
          {
            label: '亮度',
            text: '视星等 2.61——传说是全天唯一的"绿色星"。',
          },
          { label: '位置', text: '距地球约 185 光年。' },
          {
            label: '故事',
            text: '天上几乎没有绿星，古代文献却多次记载它泛着绿色，至今是未解之谜。',
          },
        ],
      },
      {
        id: 'lib-3',
        name: '折威七',
        nameEn: 'σ Lib',
        massSolar: 2,
        x: 58,
        y: 40,
        facts: [
          {
            label: '名字',
            text: '折威七：星官"折威"，主司刑杀与威仪。',
          },
          { label: '别名', text: 'σ Lib，无专名。' },
          {
            label: '星体',
            text: 'M 型红巨星，体积约太阳的 70 倍。',
          },
          { label: '亮度', text: '视星等约 3.29，偏红色。' },
          { label: '位置', text: '距地球约 288 光年。' },
          {
            label: '故事',
            text: '与左端蓝白的氐宿四形成对比，一蓝一红挂在天平两端。',
          },
        ],
      },
      {
        id: 'lib-4',
        name: '氐宿三',
        nameEn: 'γ Lib',
        massSolar: 2.5,
        x: 62,
        y: 54,
        facts: [
          {
            label: '名字',
            text: '氐宿三：氐宿第三星，右秤盘的位置。',
          },
          { label: '别名', text: 'γ Lib，无专名。' },
          {
            label: '星体',
            text: 'K 型橙色巨星，质量约太阳的 2.5 倍。',
          },
          { label: '亮度', text: '视星等约 3.91。' },
          { label: '位置', text: '距地球约 163 光年。' },
          {
            label: '故事',
            text: '稳稳压住天平的右半，像秤盘里放了东西。',
          },
        ],
      },
      {
        id: 'lib-5',
        name: '折威五',
        nameEn: 'υ Lib',
        massSolar: 1.2,
        x: 52,
        y: 66,
        facts: [
          {
            label: '名字',
            text: '折威五：折威星官一员，天平支柱的下端。',
          },
          { label: '别名', text: 'υ Lib，无专名。' },
          {
            label: '星体',
            text: 'K 型橙色巨星，质量约太阳的 1.2 倍。',
          },
          { label: '亮度', text: '视星等约 3.6。' },
          { label: '位置', text: '距地球约 195 光年。' },
          {
            label: '故事',
            text: '支柱的底座，整架天平由它撑起。',
          },
        ],
      },
    ],
  },
  {
    id: 'scorpius',
    name: '天蝎座',
    symbol: '♏',
    facts: [
      {
        label: '名字由来',
        text: '毒杀猎人俄里翁的蝎子。俄里翁夸口能猎尽天下野兽，大地女神便派蝎子蛰杀了他。',
      },
      {
        label: '神话',
        text: '宙斯把两者分置于天空两端：蝎子升起时，猎户座便落下——永不相见。',
      },
      {
        label: '形状',
        text: '黄道上最像名字的星座：弯曲的蝎尾清晰可见，心宿二是那颗红色的蝎心。',
      },
      {
        label: '观测',
        text: '夏季南天的主角；心宿二附近银河最亮，是观测星团的宝地。',
      },
    ],
    // 蝎：头与双螯在房宿四/房宿三，身体沿心宿二→尾宿一→尾宿二→尾宿五下弯，尾钩翘至尾宿八，尾宿九为毒刺
    silhouette:
      '<path d="M32 18 C26 14 22 16 20 22 C24 18 28 22 26 26 M40 22 C44 18 48 20 48 26" /><path d="M32 18 C36 24 40 28 50 42 C54 48 58 52 64 62 C68 68 72 70 70 76 C68 82 64 84 62 82" /><path d="M56 82 C58 86 56 90 52 88" /><path d="M44 34 L38 48 M52 46 L48 60 M60 56 L56 70" />',
    stars: [
      {
        id: 'sco-1',
        name: '房宿四',
        nameEn: 'Acrab',
        massSolar: 6,
        x: 32,
        y: 18,
        facts: [
          {
            label: '名字',
            text: '房宿四：源于二十八宿之房宿，苍龙的腹部，主司车驾。',
          },
          {
            label: '别名',
            text: 'Acrab，阿拉伯语"蝎子"——整个星座的名字。',
          },
          {
            label: '星体',
            text: 'B 型蓝白星组成的多合星系统，至少四颗星纠缠在一起。',
          },
          { label: '亮度', text: '视星等约 2.6。' },
          { label: '位置', text: '距地球约 530 光年。' },
          {
            label: '文化',
            text: '分野属大火（氐房心），对应古代宋地。',
          },
        ],
      },
      {
        id: 'sco-2',
        name: '房宿三',
        nameEn: 'Dschubba',
        massSolar: 12,
        x: 40,
        y: 28,
        facts: [
          {
            label: '名字',
            text: '房宿三：房宿第三星，蝎子的前额。',
          },
          {
            label: '别名',
            text: 'Dschubba，阿拉伯语"前额"。',
          },
          {
            label: '星体',
            text: 'B 型蓝白巨星，质量约太阳的 12 倍，表面约两万八千度。',
          },
          { label: '亮度', text: '视星等约 2.3。' },
          { label: '位置', text: '距地球约 400 光年。' },
          {
            label: '故事',
            text: '2000 年它突然增亮了一半，原因至今不明，是当代天文学的悬案。',
          },
        ],
      },
      {
        id: 'sco-3',
        name: '心宿二',
        nameEn: 'Antares',
        massSolar: 15,
        x: 50,
        y: 42,
        facts: [
          {
            label: '名字',
            text: '心宿二：源于二十八宿之心宿——东方苍龙的心脏。',
          },
          {
            label: '别名',
            text: 'Antares，希腊语"火星的对手"：它与火星一样红，常被认错。',
          },
          {
            label: '星体',
            text: 'M1.5 型红超巨星，质量约太阳的 15 倍，体积是太阳的数亿倍，实际亮度约太阳的六万倍。',
          },
          {
            label: '亮度',
            text: '视星等 1.06，夜空第 15 亮星，航海星之一。',
          },
          { label: '位置', text: '距地球约 550 光年。' },
          {
            label: '历史',
            text: '商代即称"大火"，古人以它的出没定农时——"七月流火"说的就是它。',
          },
        ],
      },
      {
        id: 'sco-4',
        name: '尾宿一',
        nameEn: 'Al Niyat',
        massSolar: 12,
        x: 58,
        y: 52,
        facts: [
          {
            label: '名字',
            text: '尾宿一：源于二十八宿之尾宿，苍龙的尾巴。',
          },
          {
            label: '别名',
            text: 'Al Niyat，阿拉伯语"动脉"——心脏外的一圈光晕。',
          },
          {
            label: '星体',
            text: 'B 型蓝白巨星，质量约太阳的 12 倍。',
          },
          { label: '亮度', text: '视星等约 2.9。' },
          { label: '位置', text: '距地球约 735 光年。' },
          {
            label: '文化',
            text: '分野属析木（尾箕二宿），对应古代燕地。',
          },
        ],
      },
      {
        id: 'sco-5',
        name: '尾宿二',
        nameEn: 'Larawag',
        massSolar: 1.2,
        x: 64,
        y: 62,
        facts: [
          {
            label: '名字',
            text: '尾宿二：尾宿第二星，蝎尾的开端。',
          },
          {
            label: '别名',
            text: 'Larawag：2017 年才由国际天文学联合会正式定名。',
          },
          {
            label: '星体',
            text: 'K 型橙色巨星，质量约太阳的 1.2 倍，体积约太阳的 11 倍。',
          },
          { label: '亮度', text: '视星等约 2.3。' },
          { label: '位置', text: '距地球约 64 光年，是全天较近的亮星。' },
          {
            label: '故事',
            text: '它的名字源自澳大利亚原住民，意为"鹰"——最年轻的亮星名之一。',
          },
        ],
      },
      {
        id: 'sco-6',
        name: '尾宿五',
        nameEn: 'Sargas',
        massSolar: 3,
        x: 72,
        y: 70,
        facts: [
          {
            label: '名字',
            text: '尾宿五：尾宿第五星，蝎尾弯曲处的支点。',
          },
          {
            label: '别名',
            text: 'Sargas，源于古代两河流域的星名。',
          },
          {
            label: '星体',
            text: 'F 型黄白亮巨星，体积约太阳的 20 倍。',
          },
          { label: '亮度', text: '视星等约 1.86。' },
          { label: '位置', text: '距地球约 270 光年。' },
          {
            label: '故事',
            text: '夏季南天最亮的几颗星之一，银河从它身边流过。',
          },
        ],
      },
      {
        id: 'sco-7',
        name: '尾宿八',
        nameEn: 'Shaula',
        massSolar: 10,
        x: 62,
        y: 82,
        facts: [
          {
            label: '名字',
            text: '尾宿八：尾宿第八星，蝎尾毒刺上的锋芒。',
          },
          {
            label: '别名',
            text: 'Shaula，阿拉伯语"翘起的尾巴"。',
          },
          {
            label: '星体',
            text: 'B 型蓝白星，质量约太阳的 10 倍，实际亮度约太阳的三万六千倍。',
          },
          {
            label: '亮度',
            text: '视星等 1.62，夜空第 24 亮星，航海星之一。',
          },
          { label: '位置', text: '距地球约 570 光年。' },
          {
            label: '故事',
            text: '与尾宿九并称"猫眼"——夜里看像一对发亮的小眼睛。',
          },
        ],
      },
      {
        id: 'sco-8',
        name: '尾宿九',
        nameEn: 'Lesath',
        massSolar: 11,
        x: 52,
        y: 88,
        facts: [
          {
            label: '名字',
            text: '尾宿九：尾宿第九星，毒刺旁的最后一颗。',
          },
          {
            label: '别名',
            text: 'Lesath，阿拉伯语"蜇刺"。',
          },
          {
            label: '星体',
            text: 'B 型蓝白星，质量约太阳的 11 倍。',
          },
          { label: '亮度', text: '视星等约 2.7。' },
          { label: '位置', text: '距地球约 580 光年。' },
          {
            label: '文化',
            text: '分野属析木（尾箕），对应古代燕地——蝎尾扫过北方的天空。',
          },
        ],
      },
    ],
  },
  {
    id: 'sagittarius',
    name: '射手座',
    symbol: '♐',
    facts: [
      {
        label: '名字由来',
        text: '常被描绘为喀戎——半人马族的贤者，医神与英雄们的老师，张弓搭箭。',
      },
      {
        label: '神话',
        text: '喀戎被毒箭误伤却因不死之身无法解脱，最终以自己的生命换得普罗米修斯自由，被升为星座。',
      },
      {
        label: '形状',
        text: '主星组成一把"茶壶"：壶盖、壶嘴、壶底俱全，银河正从壶嘴倾泻而出。',
      },
      {
        label: '观测',
        text: '夏季南天最热闹的天区：银河中心就在它身后，星云星团密布。',
      },
    ],
    // 半人马射手：头在斗宿二上方，手臂向前拉弓，弓弧穿过箕宿一/箕宿三，箭指向箕宿四，马身经斗宿四/斗宿六
    silhouette:
      '<path d="M42 26 C38 22 38 18 42 18 C46 18 46 22 42 26" /><path d="M42 32 L46 44 L50 52" /><path d="M46 40 C40 38 34 38 30 42" /><path d="M30 42 C26 50 28 58 30 56 M30 50 C36 46 42 42 46 40" /><path d="M34 44 L38 56" /><path d="M50 52 C56 54 62 54 66 52 C72 54 76 58 76 62" /><path d="M56 54 L54 72 M66 54 L68 72 M62 60 L60 76" />',
    stars: [
      {
        id: 'sgr-1',
        name: '箕宿三',
        nameEn: 'Kaus Australis',
        massSolar: 3.5,
        x: 36,
        y: 42,
        facts: [
          {
            label: '名字',
            text: '箕宿三：源于二十八宿之箕宿，形如簸箕，主司风。',
          },
          {
            label: '别名',
            text: 'Kaus Australis，阿拉伯语"南边的弓"。',
          },
          {
            label: '星体',
            text: 'B 型蓝白巨星，质量约太阳的 3.5 倍，表面约一万度。',
          },
          { label: '亮度', text: '视星等 1.85，射手座最亮，航海星之一。' },
          { label: '位置', text: '距地球约 143 光年。' },
          {
            label: '文化',
            text: '分野属析木（尾箕），对应古代燕地。',
          },
        ],
      },
      {
        id: 'sgr-2',
        name: '斗宿四',
        nameEn: 'Nunki',
        massSolar: 7.8,
        x: 48,
        y: 50,
        facts: [
          {
            label: '名字',
            text: '斗宿四：源于二十八宿之斗宿，形如量斗。',
          },
          {
            label: '别名',
            text: 'Nunki，巴比伦星表中最古老的恒星名之一，历史超四千年。',
          },
          {
            label: '星体',
            text: 'B 型蓝白主序星，质量约太阳的 7.8 倍，表面约一万九千度。',
          },
          { label: '亮度', text: '视星等 2.05，航海星之一。' },
          { label: '位置', text: '距地球约 228 光年。' },
          {
            label: '文化',
            text: '分野属星纪（斗牛二宿），对应古代吴越之地。',
          },
        ],
      },
      {
        id: 'sgr-3',
        name: '斗宿六',
        nameEn: 'Ascella',
        massSolar: 2,
        x: 60,
        y: 54,
        facts: [
          {
            label: '名字',
            text: '斗宿六：斗宿第六星，茶壶的壶嘴。',
          },
          { label: '别名', text: 'Ascella，拉丁语"腋下"。' },
          {
            label: '星体',
            text: 'A 型白色巨星，质量约太阳的 2 倍。',
          },
          { label: '亮度', text: '视星等约 2.6。' },
          { label: '位置', text: '距地球约 88 光年。' },
          {
            label: '故事',
            text: '银河正从壶嘴的方向倾泻而出，这里是夏季观星的起点。',
          },
        ],
      },
      {
        id: 'sgr-4',
        name: '箕宿一',
        nameEn: 'γ Sgr',
        massSolar: 2.5,
        x: 30,
        y: 56,
        facts: [
          {
            label: '名字',
            text: '箕宿一：箕宿第一星，弓的上缘。',
          },
          { label: '别名', text: 'γ Sgr，无专名。' },
          {
            label: '星体',
            text: 'K 型橙色巨星，质量约太阳的 2.5 倍。',
          },
          { label: '亮度', text: '视星等约 2.98。' },
          { label: '位置', text: '距地球约 96 光年。' },
          {
            label: '故事',
            text: '和箕宿三一起张开了射手座的弓，箭正指向天蝎之心。',
          },
        ],
      },
      {
        id: 'sgr-5',
        name: '斗宿二',
        nameEn: 'Kaus Borealis',
        massSolar: 2.5,
        x: 42,
        y: 34,
        facts: [
          {
            label: '名字',
            text: '斗宿二：斗宿第二星，茶壶的壶顶。',
          },
          {
            label: '别名',
            text: 'Kaus Borealis，阿拉伯语"北边的弓"。',
          },
          {
            label: '星体',
            text: 'K 型橙色巨星，质量约太阳的 2.5 倍。',
          },
          { label: '亮度', text: '视星等约 2.82。' },
          { label: '位置', text: '距地球约 78 光年。' },
          {
            label: '故事',
            text: '与箕宿三、斗宿六构成壶身三角，壶柄就是整张弓。',
          },
        ],
      },
      {
        id: 'sgr-6',
        name: '箕宿四',
        nameEn: 'η Sgr',
        massSolar: 1.5,
        x: 54,
        y: 66,
        facts: [
          {
            label: '名字',
            text: '箕宿四：箕宿第四星，弓弦上的箭镞。',
          },
          { label: '别名', text: 'η Sgr，无专名。' },
          {
            label: '星体',
            text: 'M 型红巨星，质量约太阳的 1.5 倍。',
          },
          { label: '亮度', text: '视星等约 3.1，偏红色。' },
          { label: '位置', text: '距地球约 149 光年。' },
          {
            label: '故事',
            text: '一支搭在弦上的红色箭镞，瞄准了天蝎座的方向。',
          },
        ],
      },
    ],
  },
  {
    id: 'capricornus',
    name: '摩羯座',
    symbol: '♑',
    facts: [
      {
        label: '名字由来',
        text: '牧神潘——半人半羊的森林之神。他躲避怪物时跃入水中，情急变形，上半身是羊、下半身是鱼。',
      },
      {
        label: '神话',
        text: '传说正是潘发明了排箫；也有说法称摩羯是养育宙斯的母山羊阿玛尔忒亚。',
      },
      {
        label: '形状',
        text: '黄道上最黯淡的星座，星点连成一个歪斜的三角，像一尾沉在水里的羊。',
      },
      {
        label: '观测',
        text: '秋季夜晚可见；太阳每年 1 月从它身后经过。',
      },
    ],
    // 羊首鱼尾：羊角自牛宿二扬起，头在牛宿一，身体斜下，鱼尾经垒壁阵三→垒壁阵四卷向牛宿四，尾鳍在牛宿六
    silhouette:
      '<path d="M45 42 C42 34 44 30 50 30" /><path d="M45 42 C50 44 55 48 58 62" /><path d="M58 62 C66 64 68 70 66 74 C62 78 56 74 54 68" /><path d="M54 68 C58 70 64 70 66 70 C70 68 72 64 70 60" /><path d="M50 50 L44 66 M60 60 L58 76" />',
    stars: [
      {
        id: 'cap-1',
        name: '垒壁阵四',
        nameEn: 'Deneb Algedi',
        massSolar: 2,
        x: 58,
        y: 62,
        facts: [
          {
            label: '名字',
            text: '垒壁阵四：星官"垒壁阵"，城墙与堡垒之阵。',
          },
          {
            label: '别名',
            text: 'Deneb Algedi，阿拉伯语"山羊的尾巴"——羊身与鱼尾的分界。',
          },
          {
            label: '星体',
            text: 'A 型白星组成的食双星系统，每 1.02 天互掩一次。',
          },
          {
            label: '亮度',
            text: '视星等 2.85，摩羯座最亮，航海星之一。',
          },
          { label: '位置', text: '距地球约 39 光年，是黄道亮星中较近的一颗。' },
          {
            label: '历史',
            text: '1784 年古德里克发现它的周期性变光，是变星研究的经典。',
          },
        ],
      },
      {
        id: 'cap-2',
        name: '牛宿一',
        nameEn: 'Dabih',
        massSolar: 2.5,
        x: 55,
        y: 48,
        facts: [
          {
            label: '名字',
            text: '牛宿一：源于二十八宿之牛宿，主司牺牲与耕牛。',
          },
          {
            label: '别名',
            text: 'Dabih，阿拉伯语"屠夫"，古阿拉伯人把它看作祭牲之额。',
          },
          {
            label: '星体',
            text: 'K 型橙巨星与 B 型星组成的多合星系统。',
          },
          { label: '亮度', text: '视星等约 3.05。' },
          { label: '位置', text: '距地球约 328 光年。' },
          {
            label: '文化',
            text: '分野属星纪（斗牛），对应古代吴越之地。',
          },
        ],
      },
      {
        id: 'cap-3',
        name: '牛宿二',
        nameEn: 'Algedi',
        massSolar: 2.5,
        x: 45,
        y: 42,
        facts: [
          {
            label: '名字',
            text: '牛宿二：牛宿第二星，羊角的位置。',
          },
          {
            label: '别名',
            text: 'Algedi，阿拉伯语"小山羊"。',
          },
          {
            label: '星体',
            text: 'G 型黄巨星；肉眼看似双星，实为两颗互不相干的星在视线方向重叠。',
          },
          { label: '亮度', text: '视星等约 3.58。' },
          { label: '位置', text: '距地球约 106 光年。' },
          {
            label: '故事',
            text: '一对"光学双星"——看起来是羊角，其实隔着几百光年。',
          },
        ],
      },
      {
        id: 'cap-4',
        name: '牛宿四',
        nameEn: 'ω Cap',
        massSolar: 2,
        x: 66,
        y: 70,
        facts: [
          {
            label: '名字',
            text: '牛宿四：牛宿第四星，鱼尾的下缘。',
          },
          { label: '别名', text: 'ω Cap，无专名。' },
          {
            label: '星体',
            text: 'M 型红巨星，体积约太阳的 60 倍。',
          },
          { label: '亮度', text: '视星等约 4.12。' },
          { label: '位置', text: '距地球约 630 光年。' },
          {
            label: '故事',
            text: '羊身与鱼尾之间的一抹暗红，像水里的火光。',
          },
        ],
      },
      {
        id: 'cap-5',
        name: '牛宿六',
        nameEn: 'ψ Cap',
        massSolar: 1.3,
        x: 70,
        y: 60,
        facts: [
          {
            label: '名字',
            text: '牛宿六：牛宿第六星，鱼尾的末端。',
          },
          { label: '别名', text: 'ψ Cap，无专名。' },
          {
            label: '星体',
            text: 'F 型黄白主序星，质量约太阳的 1.3 倍。',
          },
          { label: '亮度', text: '视星等约 4.14。' },
          { label: '位置', text: '距地球约 48 光年。' },
          {
            label: '故事',
            text: '离我们不到五十光年，是摩羯座里最近的星之一。',
          },
        ],
      },
      {
        id: 'cap-6',
        name: '垒壁阵三',
        nameEn: 'Nashira',
        massSolar: 2,
        x: 48,
        y: 66,
        facts: [
          {
            label: '名字',
            text: '垒壁阵三：垒壁阵第三星，城墙的一段。',
          },
          {
            label: '别名',
            text: 'Nashira，阿拉伯语"带来好消息者"。',
          },
          {
            label: '星体',
            text: 'A 型白色恒星，质量约太阳的 2 倍。',
          },
          { label: '亮度', text: '视星等约 3.67。' },
          { label: '位置', text: '距地球约 139 光年。' },
          {
            label: '故事',
            text: '名字像一句祝福：带来好消息的人。',
          },
        ],
      },
    ],
  },
  {
    id: 'aquarius',
    name: '水瓶座',
    symbol: '♒',
    facts: [
      {
        label: '名字由来',
        text: '特洛伊王子伽倪墨得斯——因俊美被宙斯化作巨鹰带上奥林匹斯，为众神斟酒。',
      },
      {
        label: '神话',
        text: '也有说法与丢卡利翁的大洪水有关：水瓶倾倒，洪水从天而降。',
      },
      {
        label: '形状',
        text: '星点散成之字形，像一只倾倒的水瓶，水流向南方的鲸鱼座方向蜿蜒。',
      },
      {
        label: '观测',
        text: '秋季夜晚可见；天文学上"水瓶座时代"的说法正源于春分点岁差进入此宫。',
      },
    ],
    // 持瓶者：头在危宿一，肩在虚宿一，臂持水瓶于坟墓二，水流三道经危宿二/羽林军廿六/危宿三蜿蜒而下
    silhouette:
      '<path d="M52 28 C48 24 48 20 52 20 C56 20 56 24 52 28" /><path d="M52 34 L44 38" /><path d="M48 36 C54 36 58 38 60 40" /><path d="M56 38 L64 38 L64 46 L56 46 Z" /><path d="M56 46 C50 50 50 52 50 52 C50 56 52 60 58 62" /><path d="M60 46 C62 50 64 54 66 58" /><path d="M64 46 C62 50 60 54 60 58" />',
    stars: [
      {
        id: 'aqr-1',
        name: '危宿一',
        nameEn: 'Sadalsuud',
        massSolar: 6,
        x: 52,
        y: 28,
        facts: [
          {
            label: '名字',
            text: '危宿一：源于二十八宿之危宿，屋顶与高处的意思。',
          },
          {
            label: '别名',
            text: 'Sadalsuud，阿拉伯语"幸运中的最幸运者"。',
          },
          {
            label: '星体',
            text: 'G0 型黄超巨星，与太阳同类型，质量约太阳的 6 倍，直径约 50 倍。',
          },
          { label: '亮度', text: '视星等 2.9，水瓶座最亮。' },
          { label: '位置', text: '距地球约 540 光年。' },
          {
            label: '文化',
            text: '分野属玄枵（女虚危三宿），对应古代齐地。',
          },
        ],
      },
      {
        id: 'aqr-2',
        name: '虚宿一',
        nameEn: 'Sadalmelik',
        massSolar: 6.5,
        x: 44,
        y: 38,
        facts: [
          {
            label: '名字',
            text: '虚宿一：源于二十八宿之虚宿，冬季夜空的标志。',
          },
          {
            label: '别名',
            text: 'Sadalmelik，阿拉伯语"国王的幸运星"。',
          },
          {
            label: '星体',
            text: 'G2 型黄超巨星，质量约太阳的 6.5 倍，直径约 60 倍。',
          },
          { label: '亮度', text: '视星等约 2.95。' },
          { label: '位置', text: '距地球约 520 光年。' },
          {
            label: '故事',
            text: '古中国以虚宿定仲秋，它升起时，冬天就近了。',
          },
        ],
      },
      {
        id: 'aqr-3',
        name: '坟墓二',
        nameEn: 'ζ Aqr',
        massSolar: 1.8,
        x: 60,
        y: 40,
        facts: [
          {
            label: '名字',
            text: '坟墓二：星官"坟墓"，与哭泣、丧葬相关。',
          },
          {
            label: '别名',
            text: 'ζ Aqr——一个美丽的翻译事故：阿拉伯语原义"幸运"，被误译成了"坟墓"。',
          },
          {
            label: '星体',
            text: 'F 型黄白双星，质量约太阳的 1.8 倍。',
          },
          { label: '亮度', text: '视星等约 3.65。' },
          { label: '位置', text: '距地球约 92 光年。' },
          {
            label: '故事',
            text: '名字的误会流传了几百年，天文学家至今仍沿用。',
          },
        ],
      },
      {
        id: 'aqr-4',
        name: '危宿三',
        nameEn: 'Albali',
        massSolar: 2.2,
        x: 66,
        y: 58,
        facts: [
          {
            label: '名字',
            text: '危宿三：危宿第三星，水流的中段。',
          },
          {
            label: '别名',
            text: 'Albali，阿拉伯语"吞咽者"，指水瓶倾斜的瓶口。',
          },
          {
            label: '星体',
            text: 'A 型白色恒星，质量约太阳的 2.2 倍。',
          },
          { label: '亮度', text: '视星等约 3.78。' },
          { label: '位置', text: '距地球约 215 光年。' },
          {
            label: '故事',
            text: '水流正是从它身边倾泻而下，一路向南。',
          },
        ],
      },
      {
        id: 'aqr-5',
        name: '羽林军廿六',
        nameEn: 'Skat',
        massSolar: 2.5,
        x: 58,
        y: 62,
        facts: [
          {
            label: '名字',
            text: '羽林军廿六：星官"羽林军"——天子的禁卫军，数十星横贯南天。',
          },
          { label: '别名', text: 'Skat，阿拉伯语"腿"。' },
          {
            label: '星体',
            text: 'A 型白色恒星，质量约太阳的 2.5 倍。',
          },
          { label: '亮度', text: '视星等约 3.27。' },
          { label: '位置', text: '距地球约 160 光年。' },
          {
            label: '故事',
            text: '水瓶的腿，踩在南方低空的水流里。',
          },
        ],
      },
      {
        id: 'aqr-6',
        name: '危宿二',
        nameEn: 'Sadachbia',
        massSolar: 2.7,
        x: 50,
        y: 52,
        facts: [
          {
            label: '名字',
            text: '危宿二：危宿第二星，水流的中轴。',
          },
          {
            label: '别名',
            text: 'Sadachbia，阿拉伯语"帐篷里的幸运星"。',
          },
          {
            label: '星体',
            text: 'A 型白色恒星，质量约太阳的 2.7 倍。',
          },
          { label: '亮度', text: '视星等约 3.86。' },
          { label: '位置', text: '距地球约 158 光年。' },
          {
            label: '故事',
            text: '像帐篷里透出的光，是三股水流交汇的地方。',
          },
        ],
      },
    ],
  },
  {
    id: 'pisces',
    name: '双鱼座',
    symbol: '♓',
    facts: [
      {
        label: '名字由来',
        text: '爱与美之神阿佛洛狄忒和她的儿子厄洛斯。为躲避怪物提丰，母子化为两条鱼跃入水中。',
      },
      {
        label: '神话',
        text: '为免失散，他们把尾巴用丝带系在一起——双鱼座的"结"正是外屏三。',
      },
      {
        label: '形状',
        text: '两条鱼一东一西，丝带在外屏三处打结相连；西边的鱼还衔着一个小圆圈。',
      },
      {
        label: '观测',
        text: '秋季夜晚可见；现代春分点就位于双鱼座，太阳每年 3 月经过这里。',
      },
    ],
    // 双鱼：西鱼环绕在霹雳一/奎宿十六之间，东鱼在右更二/外屏七之间，丝带于外屏三打结
    silhouette:
      '<path d="M42 40 C38 40 34 44 36 48 C38 52 42 50 44 46 C46 42 44 40 42 40" /><path d="M42 40 C46 38 48 36 50 36" /><path d="M50 36 C48 32 48 30 50 28" /><path d="M44 46 C46 48 48 50 48 50" /><path d="M48 52 C48 58 50 62 50 66 C54 70 62 68 60 62 C58 58 54 60 52 64" /><path d="M60 62 C64 60 68 58 72 56 M60 62 C62 66 64 68 66 68" />',
    stars: [
      {
        id: 'psc-1',
        name: '右更二',
        nameEn: 'η Psc',
        massSolar: 3,
        x: 60,
        y: 58,
        facts: [
          {
            label: '名字',
            text: '右更二：星官"右更"，主司报时的官吏。',
          },
          { label: '别名', text: 'η Psc，无专名。' },
          {
            label: '星体',
            text: 'G 型黄巨星，质量约太阳的 3 倍，亮度为太阳的 460 倍。',
          },
          { label: '亮度', text: '视星等约 3.62，双鱼座最亮。' },
          { label: '位置', text: '距地球约 350 光年。' },
          {
            label: '故事',
            text: '站在东边那条鱼的鱼尾上，是双鱼座唯一"看得清"的星。',
          },
        ],
      },
      {
        id: 'psc-2',
        name: '外屏七',
        nameEn: 'γ Psc',
        massSolar: 2.2,
        x: 50,
        y: 66,
        facts: [
          {
            label: '名字',
            text: '外屏七：星官"外屏"，天子的屏风。',
          },
          { label: '别名', text: 'γ Psc，无专名。' },
          {
            label: '星体',
            text: 'K 型橙色巨星，质量约太阳的 2.2 倍。',
          },
          { label: '亮度', text: '视星等约 3.7。' },
          { label: '位置', text: '距地球约 138 光年。' },
          {
            label: '故事',
            text: '东边那条鱼的身体，泛着温和的橙光。',
          },
        ],
      },
      {
        id: 'psc-3',
        name: '霹雳一',
        nameEn: 'ι Psc',
        massSolar: 1.3,
        x: 42,
        y: 44,
        facts: [
          {
            label: '名字',
            text: '霹雳一：星官"霹雳"，主司雷电。',
          },
          { label: '别名', text: 'ι Psc，无专名。' },
          {
            label: '星体',
            text: 'F 型黄白主序星，质量约太阳的 1.3 倍。',
          },
          { label: '亮度', text: '视星等约 4.13。' },
          { label: '位置', text: '距地球约 45 光年。' },
          {
            label: '故事',
            text: '西边那条鱼的鱼尾，离我们不到五十光年。',
          },
        ],
      },
      {
        id: 'psc-4',
        name: '外屏增一',
        nameEn: 'θ Psc',
        massSolar: 1.7,
        x: 50,
        y: 36,
        facts: [
          {
            label: '名字',
            text: '外屏增一：外屏的增星，西鱼背上的鳍。',
          },
          { label: '别名', text: 'θ Psc，无专名。' },
          {
            label: '星体',
            text: 'K 型橙色巨星，质量约太阳的 1.7 倍。',
          },
          { label: '亮度', text: '视星等约 4.27。' },
          { label: '位置', text: '距地球约 159 光年。' },
          {
            label: '故事',
            text: '游在丝带上方的一颗，像露出水面的鱼鳍。',
          },
        ],
      },
      {
        id: 'psc-5',
        name: '奎宿十六',
        nameEn: 'ω Psc',
        massSolar: 1.5,
        x: 36,
        y: 46,
        facts: [
          {
            label: '名字',
            text: '奎宿十六：源于二十八宿之奎宿，主司文章。',
          },
          { label: '别名', text: 'ω Psc，无专名。' },
          {
            label: '星体',
            text: 'F 型黄白次巨星，质量约太阳的 1.5 倍。',
          },
          { label: '亮度', text: '视星等约 4.01。' },
          { label: '位置', text: '距地球约 106 光年。' },
          {
            label: '文化',
            text: '分野属降娄（奎娄二宿），对应古代鲁地。',
          },
        ],
      },
      {
        id: 'psc-6',
        name: '外屏三',
        nameEn: 'Alrescha',
        massSolar: 1.9,
        x: 48,
        y: 50,
        facts: [
          {
            label: '名字',
            text: '外屏三：外屏第三星，两条鱼之间的结。',
          },
          {
            label: '别名',
            text: 'Alrescha，阿拉伯语"绳子"——系住两条鱼的丝带。',
          },
          {
            label: '星体',
            text: 'A 型白色双星，绕转周期超过 900 年。',
          },
          { label: '亮度', text: '视星等约 3.82。' },
          { label: '位置', text: '距地球约 151 光年。' },
          {
            label: '故事',
            text: '双鱼之结：丝带在这里打结，把母子化成的两条鱼永远连在一起。',
          },
        ],
      },
    ],
  },
]

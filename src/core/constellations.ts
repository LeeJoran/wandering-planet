// 星座目录（试点：白羊 / 狮子 / 天蝎）。数据驱动，后续可任意增删星座。
// 每颗星：x/y 为 0-100 相对坐标；数组顺序 = 点亮顺序 = 连线顺序。

export interface ConstellationStar {
  id: string
  name: string
  nameEn: string
  mass: string // 重量（简化科普描述）
  distance: string // 位置（距离描述）
  story: string // 小故事
  x: number
  y: number
}

export interface Constellation {
  id: string
  name: string
  symbol: string
  stars: ConstellationStar[]
}

export const CONSTELLATIONS: Constellation[] = [
  {
    id: 'aries',
    name: '白羊座',
    symbol: '♈',
    stars: [
      {
        id: 'aries-1',
        name: '娄宿三',
        nameEn: 'Hamal',
        mass: '橙巨星，约 1.5 倍太阳质量',
        distance: '约 66 光年',
        story: '白羊座最亮的星，名字源自阿拉伯语"羊头"，是整个白羊的起点。',
        x: 30,
        y: 44,
      },
      {
        id: 'aries-2',
        name: '娄宿一',
        nameEn: 'Sheratan',
        mass: '双星系统，约 2 倍太阳质量',
        distance: '约 60 光年',
        story: '与娄宿三一起构成羊角，两千多年前的春分点曾落在它附近。',
        x: 24,
        y: 56,
      },
      {
        id: 'aries-3',
        name: '娄宿二',
        nameEn: 'Mesarthim',
        mass: '双星，约 2 倍太阳质量',
        distance: '约 164 光年',
        story: '1664 年胡克最早用望远镜确认的双星之一，是早期天文学的一处里程碑。',
        x: 38,
        y: 58,
      },
      {
        id: 'aries-4',
        name: '天阴四',
        nameEn: 'Botein',
        mass: 'K 型巨星',
        distance: '约 168 光年',
        story: '名字源自阿拉伯语"小肚子"，安静地挂在羊身中段。',
        x: 50,
        y: 66,
      },
      {
        id: 'aries-5',
        name: '白羊座 ε',
        nameEn: 'ε Ari',
        mass: '双星',
        distance: '约 290 光年',
        story: '没有专属中文名的一颗，用希腊字母编号，是羊身靠后的一环。',
        x: 62,
        y: 70,
      },
      {
        id: 'aries-6',
        name: '胃宿三',
        nameEn: '41 Ari',
        mass: '蓝白色 B 型星，约 3 倍太阳质量',
        distance: '约 160 光年',
        story: '落在羊尾处，是这只羊最年轻明亮的一颗。',
        x: 74,
        y: 62,
      },
    ],
  },
  {
    id: 'leo',
    name: '狮子座',
    symbol: '♌',
    stars: [
      {
        id: 'leo-1',
        name: '轩辕十四',
        nameEn: 'Regulus',
        mass: '约 3.8 倍太阳质量，高速自转',
        distance: '约 79 光年',
        story: '狮子座的心脏，古波斯四颗"王者之星"之一，几乎正落在黄道上。',
        x: 30,
        y: 72,
      },
      {
        id: 'leo-2',
        name: '轩辕十三',
        nameEn: 'η Leo',
        mass: '白色超巨星',
        distance: '约 1300 光年',
        story: '镰刀柄上最远的一颗，隔着千余光年与轩辕十四相望。',
        x: 32,
        y: 58,
      },
      {
        id: 'leo-3',
        name: '轩辕十二',
        nameEn: 'Algieba',
        mass: '双星，两颗巨星互相绕转',
        distance: '约 130 光年',
        story: '名字意为"狮子的鬃毛"，是镰刀弧线正中的金色节点。',
        x: 44,
        y: 48,
      },
      {
        id: 'leo-4',
        name: '轩辕九',
        nameEn: 'Adhafera',
        mass: '约 2.2 倍太阳质量',
        distance: '约 274 光年',
        story: '静静待在鬃毛与镰刀之间，中国古代星官把它编入"轩辕"一组。',
        x: 46,
        y: 36,
      },
      {
        id: 'leo-5',
        name: '轩辕十',
        nameEn: 'Rasalas',
        mass: 'K 型巨星',
        distance: '约 124 光年',
        story: '意为"狮子头北侧"，镰刀顶端的一颗。',
        x: 38,
        y: 25,
      },
      {
        id: 'leo-6',
        name: '轩辕八',
        nameEn: 'ε Leo',
        mass: '约 2 倍太阳质量',
        distance: '约 247 光年',
        story: '镰刀最顶端的星，划过天际的弧线到这里收住。',
        x: 29,
        y: 14,
      },
      {
        id: 'leo-7',
        name: '西上相',
        nameEn: 'Zosma',
        mass: '约 2.2 倍太阳质量',
        distance: '约 58 光年',
        story: '意为"腰带"，横在狮背，连起镰刀与尾部三角。',
        x: 60,
        y: 50,
      },
      {
        id: 'leo-8',
        name: '五帝座一',
        nameEn: 'Denebola',
        mass: '约 1.8 倍太阳质量',
        distance: '约 36 光年',
        story: '意为"狮子的尾巴"，与轩辕十四、大角、角宿一组成"春季大三角"。',
        x: 76,
        y: 68,
      },
    ],
  },
  {
    id: 'scorpius',
    name: '天蝎座',
    symbol: '♏',
    stars: [
      {
        id: 'sco-1',
        name: '房宿四',
        nameEn: 'Acrab',
        mass: '多合星系统',
        distance: '约 530 光年',
        story: '蝎子的头部，由至少四颗星纠缠而成。',
        x: 32,
        y: 18,
      },
      {
        id: 'sco-2',
        name: '房宿三',
        nameEn: 'Dschubba',
        mass: '约 12 倍太阳质量',
        distance: '约 400 光年',
        story: '意为"前额"，两千年前曾突然变亮，如今已恢复平静。',
        x: 40,
        y: 28,
      },
      {
        id: 'sco-3',
        name: '心宿二',
        nameEn: 'Antares',
        mass: '红超巨星，约 15 倍太阳质量',
        distance: '约 550 光年',
        story: '天蝎之心，体积是太阳的几亿倍。名字意为"火星的对手"——因为它和火星一样红。',
        x: 50,
        y: 42,
      },
      {
        id: 'sco-4',
        name: '尾宿一',
        nameEn: 'Al Niyat',
        mass: '约 12 倍太阳质量',
        distance: '约 735 光年',
        story: '意为"动脉"，紧贴在心宿二身旁，是心脏外的一圈光晕。',
        x: 58,
        y: 52,
      },
      {
        id: 'sco-5',
        name: '尾宿二',
        nameEn: 'Larawag',
        mass: '约 1.2 倍太阳质量',
        distance: '约 64 光年',
        story: '尾巴的开端，2017 年才被正式定名，是全天较近的亮星之一。',
        x: 64,
        y: 62,
      },
      {
        id: 'sco-6',
        name: '尾宿五',
        nameEn: 'Sargas',
        mass: '约 3 倍太阳质量',
        distance: '约 270 光年',
        story: '蝎尾弯曲处的支点，夏季南天最亮的几颗星之一。',
        x: 72,
        y: 70,
      },
      {
        id: 'sco-7',
        name: '尾宿八',
        nameEn: 'Shaula',
        mass: '约 10 倍太阳质量',
        distance: '约 570 光年',
        story: '意为"翘起的尾巴"，就是蝎子毒刺上的锋芒。',
        x: 62,
        y: 82,
      },
      {
        id: 'sco-8',
        name: '尾宿九',
        nameEn: 'Lesath',
        mass: '约 11 倍太阳质量',
        distance: '约 580 光年',
        story: '毒刺旁的一颗，与尾宿八并称"猫眼"，夜里看像一对发亮的小眼睛。',
        x: 52,
        y: 88,
      },
    ],
  },
]

export function getConstellation(id: string): Constellation | undefined {
  return CONSTELLATIONS.find((c) => c.id === id)
}

export function findConstellationStar(constellationId: string, starId: string): ConstellationStar | null {
  const c = getConstellation(constellationId)
  return c?.stars.find((s) => s.id === starId) ?? null
}

export interface ConstellationProgress {
  lit: number
  total: number
  remaining: number
  next: ConstellationStar | null
  complete: boolean
}

export function progressOf(c: Constellation, litIds: ReadonlySet<string>): ConstellationProgress {
  const lit = c.stars.filter((s) => litIds.has(s.id)).length
  const next = c.stars.find((s) => !litIds.has(s.id)) ?? null
  return { lit, total: c.stars.length, remaining: c.stars.length - lit, next, complete: next === null }
}

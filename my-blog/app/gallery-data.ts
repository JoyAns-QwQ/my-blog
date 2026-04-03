// ============================================================
// 📸 图集配置文件
// 在这里修改图片数据，每张图片对应一个对象
// ============================================================

export interface GalleryPhoto {
  id: number
  src: string      // 图片路径（相对 /public 目录）
  title: string    // 图片标题
  date: string     // 日期，格式 YYYY-MM-DD
  desc: string     // 图片描述（显示在绿色标签上）
}

const galleryPhotos: GalleryPhoto[] = [
  { id: 1, src: '/static/images/20220331.png', title: '绘画',  date: '2022-03-31', desc: '一个板绘' },
  { id: 2, src: '/static/images/ruihappy.png',       title: '日常',  date: '2025-06-12', desc: '运势' },
  { id: 3, src: '/static/images/20241003.png', title: '日常',  date: '2024-10-03', desc: 'with 蔡🐕' },
  { id: 4, src: '/static/images/20220408.png',       title: '绘画',  date: '2022-04-08', desc: '临摹' },
  { id: 5, src: '/static/images/20260330.png', title: '日常',  date: '2026-03-30', desc: '萌' },
]

export default galleryPhotos

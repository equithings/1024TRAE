/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // TRAE 品牌色（更新为#32F08C主题）
        'trae-blue': '#0084FF',
        'trae-red': '#FF3B30',
        'trae-green': '#32F08C', // 主题色
        'trae-purple': '#AF52DE',
        'trae-primary': '#32F08C', // 新增主题色
        // 游戏方块色
        'tile-2': '#EEE4DA',
        'tile-4': '#EDE0C8',
        'tile-8': '#F2B179',
        'tile-16': '#F59563',
        'tile-32': '#F67C5F',
        'tile-64': '#F65E3B',
        // 莫兰迪色系 - 明显区分
        'tile-128': '#42966f',      // 薄荷绿（Mint Green）
        'tile-256': '#b84d4dff',      // 藕粉色（Dusty Rose）
        'tile-512': '#2b66a1ff',      // 雾霾蓝（Dusty Blue）
        'tile-1024': '#7d6149',     // 焦糖金（Caramel Gold）
      },
      fontFamily: {
        mono: ['"Courier New"', 'monospace'],
      },
    },
  },
  plugins: [],
}

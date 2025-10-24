# 音效文件说明

## 需要的音效文件

请将以下音效文件放置在 `public/sounds/` 目录下：

### 1. foldedAreas.mp3 (必需)
- **用途**: 方块合并时播放
- **时长**: 建议 0.2-0.5 秒
- **音量**: 适中，不刺耳
- **格式**: MP3
- **来源**: 你需要将原有的 `src/foldedAreas.mp3` 复制到这里

### 2. move.mp3 (可选)
- **用途**: 方块移动时播放
- **时长**: 建议 0.1-0.3 秒
- **格式**: MP3

### 3. collect.mp3 (可选)
- **用途**: 收集TRAE字母时播放
- **时长**: 建议 0.3-0.5 秒
- **格式**: MP3

### 4. victory.mp3 (可选)
- **用途**: 达成胜利时播放
- **时长**: 建议 1-2 秒
- **格式**: MP3

## 如何添加音效

1. 将 `src/foldedAreas.mp3` 复制到 `public/sounds/foldedAreas.mp3`
   ```bash
   # Windows
   copy src\foldedAreas.mp3 public\sounds\foldedAreas.mp3
   
   # macOS/Linux
   cp src/foldedAreas.mp3 public/sounds/foldedAreas.mp3
   ```

2. 其他音效文件也放入 `public/sounds/` 目录

3. 音效会在游戏加载时自动预加载

4. 合并方块时会自动播放 `foldedAreas.mp3`

## 音量控制

默认音量设置为 0.3 (30%)，可以在代码中调整：

```typescript
// 在 store/gameStore.ts 中
playSound('merge', 0.3); // 第二个参数是音量 (0.0 - 1.0)
```

## 浏览器兼容性

- 支持所有现代浏览器
- Safari 需要用户交互后才能播放音效
- 如果音效无法播放，请检查浏览器控制台的警告信息

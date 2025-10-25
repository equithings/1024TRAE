// 音效播放工具

import { assetPath } from './path';

// 音效文件路径（暂时所有音效都使用同一个文件）
// 使用 assetPath 函数以适配 GitHub Pages 的 basePath
const SOUNDS = {
  merge: assetPath('/sounds/foldedAreas.mp3'),
  move: assetPath('/sounds/foldedAreas.mp3'),
  collect: assetPath('/sounds/foldedAreas.mp3'),
  victory: assetPath('/sounds/foldedAreas.mp3'),
} as const;

// 音频池，每个音效准备3个实例避免卡顿
const audioPool: Record<string, HTMLAudioElement[]> = {};
const POOL_SIZE = 3;

// 预加载音效
export function preloadSounds() {
  if (typeof window === 'undefined') return;

  Object.entries(SOUNDS).forEach(([key, path]) => {
    audioPool[key] = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      try {
        const audio = new Audio(path);
        audio.preload = 'auto';
        audio.load(); // 强制加载
        audioPool[key].push(audio);
      } catch (error) {
        console.warn(`Failed to preload sound: ${key}`, error);
      }
    }
  });
}

// 获取可用的音频实例
function getAvailableAudio(soundName: keyof typeof SOUNDS): HTMLAudioElement | null {
  const pool = audioPool[soundName];
  if (!pool || pool.length === 0) return null;

  // 找到已播放完成或未播放的实例
  const available = pool.find(audio => audio.paused || audio.ended);
  return available || pool[0]; // 如果都在播放，使用第一个
}

// 播放音效
export function playSound(soundName: keyof typeof SOUNDS, volume: number = 0.5) {
  if (typeof window === 'undefined') return;

  try {
    const audio = getAvailableAudio(soundName);
    if (!audio) return;

    // 只在音频暂停时重置位置，避免卡顿
    if (audio.paused) {
      audio.currentTime = 0;
    }

    audio.volume = Math.max(0, Math.min(1, volume));

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        // 静默失败，避免影响游戏体验
        console.warn(`Failed to play sound: ${soundName}`, error);
      });
    }
  } catch (error) {
    console.warn(`Error playing sound: ${soundName}`, error);
  }
}

// 防抖播放（避免短时间内重复播放）
const lastPlayTime: Record<string, number> = {};
const DEBOUNCE_TIME = 50; // 50ms内不重复播放

export function playSoundDebounced(soundName: keyof typeof SOUNDS, volume: number = 0.5) {
  const now = Date.now();
  const last = lastPlayTime[soundName] || 0;

  if (now - last > DEBOUNCE_TIME) {
    playSound(soundName, volume);
    lastPlayTime[soundName] = now;
  }
}

// 停止所有音效
export function stopAllSounds() {
  if (typeof window === 'undefined') return;

  Object.values(audioPool).flat().forEach(audio => {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (error) {
      // 忽略错误
    }
  });
}

// 设置全局音量
export function setGlobalVolume(volume: number) {
  if (typeof window === 'undefined') return;

  const clampedVolume = Math.max(0, Math.min(1, volume));
  Object.values(audioPool).flat().forEach(audio => {
    audio.volume = clampedVolume;
  });
}

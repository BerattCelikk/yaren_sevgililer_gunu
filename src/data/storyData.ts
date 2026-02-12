export interface StoryScene {
  id: number;
  videoSrc: string;
  dialogue: string;
}

export const storyScenes: StoryScene[] = [
  {
    id: 1,
    videoSrc: '/videos/first_part_video.mp4',
    dialogue: 'İlk gördüğüm an, kalbim hızla çarpmaya başladı. Sanki zaman durmuştu...'
  },
  {
    id: 2,
    videoSrc: '/videos/second_part_video.mp4',
    dialogue: 'Her gün seninle konuşmak için bahaneler arıyordum. Gülüşün, her şeyi unutturuyordu.'
  },
  {
    id: 3,
    videoSrc: '/videos/third_part_video.mp4',
    dialogue: 'Birlikte geçirdiğimiz her an, hayatımın en güzel anıları oldu. Sen yanımdayken her şey mükemmeldi.'
  },
  {
    id: 4,
    videoSrc: '/videos/fourth_part_video.mp4',
    dialogue: 'Artık sadece arkadaş olmak istemiyordum. Sana olan hislerim her geçen gün büyüyordu...'
  },
  {
    id: 5,
    videoSrc: '/videos/fifth_part_video.mp4',
    dialogue: 'Bu Sevgililer Günü, sana gerçek duygularımı söylemenin zamanı geldi.'
  },
  {
    id: 6,
    videoSrc: '/videos/sixth_part_video.mp4',
    dialogue: 'Sevgilim olur musun? Sen benim için her şeyden çok daha değerlisin. 💕'
  }
];

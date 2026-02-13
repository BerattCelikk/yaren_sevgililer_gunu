export interface StoryScene {
  id: number;
  videoSrc: string;
  // dialogue can be a single string or an array of paginated strings
  dialogue: string | string[];
}

export const storyScenes: StoryScene[] = [
  {
    id: 1,
    videoSrc: '/videos/first_part_video.mp4',
    // Scene 1: split into 2 parts so mini-game starts after both parts viewed
    dialogue: [
      "Her şey bu sınıfta başladı... Senin o gün elinde kahveyle yanıma yaklaştığın o an...",
      "...sadece bir grup ödevi yapacağımızı sanıyordum ama aslında hayatımın en güzel hikayesine 'Start' vermiştik."
    ]
  },
  {
    id: 2,
    videoSrc: '/videos/second_part_video.mp4',
    dialogue: [
      "Grup ödevi için heyecanla yerimizden kalkarken, ayağının uyuşmasıyla bir an sendeleyişin...",
      "O an refleksle sana yardımcı olmaya çalışırken yaşadığım o tatlı telaş, aslında sana dair hislerimin ilk kıvılcımıydı. O küçük sakarlık, en büyük şansım oldu."
    ]
  },
  {
    id: 3,
    videoSrc: '/videos/third_part_video.mp4',
    // Scene 3: split into 3 parts (max ~4 lines each)
    dialogue: [
      "O küçük sakarlık bizi birbirimize o kadar yaklaştırmıştı ki, bir anda etrafımızdaki her şey sessizleşti.",
      "Sadece ikimiz ve o anın büyüsü vardı. Gülüşün, kalbimde daha önce hiç duymadığım bir melodi gibi yankılanmaya başladı.",
      "O gün anladım ki, seninle her anım hayatımın en güzel 'sahnesi' olacaktı."
    ]
  },
  {
    id: 4,
    videoSrc: '/videos/fourth_part_video.mp4',
    dialogue: [
      "Gecenin en karanlık anında bile, odamı aydınlatan tek şey telefonumun ekranı değil, senin kelimelerindi.",
      "Saatler ilerlese de sana 'iyi geceler' deyip o bağı koparmaya kıyamıyordum. O anlarda aramızdaki mesafeler siliniyor, sadece sen ve ben kalıyorduk."
    ]
  },
  {
    id: 5,
    videoSrc: '/videos/fifth_part_video.mp4',
    // Scene 5: split into two shorter parts
    dialogue: [
      "Sıradan bir kahve randevusundan, beraber paylaşılan sıcak bir yemeğe...",
      "Seninle geçen her an, dünyadaki tüm dertleri unutturmaya yetiyor. Bakışlarındaki o huzuru bulduğumdan beri, başka hiçbir yer bana senin yanın kadar 'ev' gibi hissettirmedi."
    ]
  },
  {
    id: 6,
    videoSrc: '/videos/sixth_part_video.mp4',
    dialogue: 'Sevgilim olur musun? Sen benim için her şeyden çok daha değerlisin. 💕'
  }
];

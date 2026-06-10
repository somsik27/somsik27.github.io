export type MapLink = {
  label: string;
  url: string;
  ariaLabel: string;
};

export type GalleryImage = {
  src: string;
  alt: string;
};

export type TransportationItem = {
  title: string;
  lines: string[];
};

export type UploadSettings = {
  enabled: boolean;
  endpointUrl: string;
  maxFiles: number;
  maxFileSizeMb: number;
  allowedMimeTypes: string[];
  teaserText: string;
  submitLabel: string;
  successMessage: string;
};

export const invitation = {
  couple: {
    groom: '최윤식',
    bride: '정솜이',
  },
  event: {
    isoDateTime: '2027-01-24T15:40:00+09:00',
    displayDate: '2027년 1월 24일 일요일',
    displayTime: '오후 3시 40분',
    shortDate: '2027.01.24',
  },
  hero: {
    imageSrc: 'images/generated-wedding/studio-hero-face-lock.png',
    imageAlt: '스튜디오 웨딩 콘셉트로 촬영한 최윤식과 정솜이',
  },
  invitationMessage: [
    '서로의 계절을 오래 바라보다',
    '이제 같은 방향으로 걸어가려 합니다.',
    '소중한 분들을 모시고 첫걸음을 나누고 싶습니다.',
    '함께해 주시면 더없이 기쁘겠습니다.',
  ],
  venue: {
    name: '더 컨벤션 송파문정',
    hall: '12층 그랜드볼룸',
    address: '서울 송파구 송파대로 155 NH송파농협',
    websiteUrl: 'https://songpa.theconvention.co.kr',
    mapLinks: [
      {
        label: '네이버 길찾기',
        url: 'nmap://route/public?dlat=37.48400527244593&dlng=127.1227891177527&dname=%EB%8D%94%20%EC%BB%A8%EB%B2%A4%EC%85%98%20%EC%86%A1%ED%8C%8C%EB%AC%B8%EC%A0%95&appname=somsik27.github.io',
        ariaLabel: '네이버지도 앱에서 더 컨벤션 송파문정 길찾기 열기',
      },
      {
        label: '카카오 길찾기',
        url: 'https://place.map.kakao.com/167068900',
        ariaLabel: '카카오맵에서 더 컨벤션 송파문정 길찾기 열기',
      },
      {
        label: '티맵',
        url: 'https://apis.openapi.sk.com/tmap/app/routes?name=%EB%8D%94%20%EC%BB%A8%EB%B2%A4%EC%85%98%20%EC%86%A1%ED%8C%8C%EB%AC%B8%EC%A0%95',
        ariaLabel: '티맵에서 예식장 길안내 열기',
      },
    ] satisfies MapLink[],
  },
  transportation: {
    parking: {
      title: '주차 안내',
      lines: [
        '주차 안내는 추후 업데이트 예정입니다.',
        '주말에는 혼잡할 수 있어 여유 있게 도착해 주세요.',
      ],
    },
    publicTransit: {
      title: '대중교통 안내',
      lines: [
        '지하철 8호선 문정역 3번 출구',
        '내비게이션에서 더 컨벤션 송파문정을 검색해 주세요.',
      ],
    },
    shuttle: null as TransportationItem | null,
  },
  film: {
    title: 'Wedding Film',
    videoUrl: '',
    thumbnailSrc: 'images/generated-wedding/studio-hero-face-lock.png',
    thumbnailAlt: '최윤식과 정솜이의 영상 썸네일',
  },
  gallery: [
    {
      src: 'images/generated-wedding/studio-hero-face-lock.png',
      alt: '스튜디오 웨딩 콘셉트의 최윤식과 정솜이',
    },
    {
      src: 'images/real-hero.jpg',
      alt: '해변에서 함께 미소 짓는 최윤식과 정솜이',
    },
    {
      src: 'images/gallery/real-couple-close.jpg',
      alt: '길 위에서 함께 카메라를 바라보는 최윤식과 정솜이',
    },
    {
      src: 'images/gallery/real-couple-cafe.jpg',
      alt: '가까이 앉아 카메라를 바라보는 최윤식과 정솜이',
    },
    {
      src: 'images/gallery/real-bride-smile.jpg',
      alt: '꽃이 핀 길에서 웃고 있는 정솜이',
    },
    {
      src: 'images/gallery/real-groom-bench.jpg',
      alt: '공원 벤치에 앉아 있는 최윤식',
    },
    {
      src: 'images/gallery/real-bride-travel.jpg',
      alt: '여행지에서 카메라를 바라보는 정솜이',
    },
    {
      src: 'images/gallery/real-groom-close.jpg',
      alt: '헤드폰을 쓰고 미소 짓는 최윤식',
    },
    {
      src: 'images/gallery/real-bride-night.jpg',
      alt: '분홍색 블라우스를 입고 서 있는 정솜이',
    },
    {
      src: 'images/gallery/real-bride-toast.jpg',
      alt: '잔을 들고 미소 짓는 정솜이',
    },
    {
      src: 'images/gallery/real-couple-bus.jpg',
      alt: '버스 안에서 함께 카메라를 바라보는 최윤식과 정솜이',
    },
  ] satisfies GalleryImage[],
  photoUpload: {
    enabled: true,
    endpointUrl: 'https://script.google.com/macros/s/AKfycbxmkIXWYMfuVWuUCmLj5OV2bxwah_L2VKSq9zBxk0xPRAql7kf3nidOrfSfOTTkYIIj/exec',
    maxFiles: 5,
    maxFileSizeMb: 8,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    teaserText: '예식 후 방명록과 사진 공유 링크가 열릴 예정입니다.',
    submitLabel: '사진 공유하기',
    successMessage: '소중한 마음이 잘 전달되었습니다. 고맙습니다.',
  } satisfies UploadSettings,
};

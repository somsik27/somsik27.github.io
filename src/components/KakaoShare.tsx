import { MessageCircleHeart } from 'lucide-react';
import type { KakaoShareSettings, invitation } from '../data/invitation';

type KakaoShareProps = {
  event: typeof invitation.event;
  share: KakaoShareSettings;
  venue: typeof invitation.venue;
};

type KakaoButton = {
  title: string;
  link: {
    mobileWebUrl: string;
    webUrl: string;
  };
};

type KakaoSdk = {
  isInitialized: () => boolean;
  init: (key: string) => void;
  Share: {
    sendDefault: (payload: {
      objectType: 'location';
      address: string;
      addressTitle: string;
      content: {
        title: string;
        description: string;
        imageUrl: string;
        link: {
          mobileWebUrl: string;
          webUrl: string;
        };
      };
      buttons: KakaoButton[];
    }) => void;
  };
};

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

const KAKAO_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.5/kakao.min.js';
const KAKAO_SCRIPT_ID = 'kakao-js-sdk';

function loadKakaoSdk() {
  return new Promise<KakaoSdk>((resolve, reject) => {
    if (window.Kakao) {
      resolve(window.Kakao);
      return;
    }

    const existingScript = document.getElementById(KAKAO_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.Kakao) {
          resolve(window.Kakao);
        } else {
          reject(new Error('카카오 SDK를 불러오지 못했습니다.'));
        }
      });
      existingScript.addEventListener('error', () => {
        reject(new Error('카카오 SDK를 불러오지 못했습니다.'));
      });
      return;
    }

    const script = document.createElement('script');

    script.id = KAKAO_SCRIPT_ID;
    script.src = KAKAO_SDK_URL;
    script.async = true;
    script.onload = () => {
      if (window.Kakao) {
        resolve(window.Kakao);
      } else {
        reject(new Error('카카오 SDK를 불러오지 못했습니다.'));
      }
    };
    script.onerror = () => {
      reject(new Error('카카오 SDK를 불러오지 못했습니다.'));
    };
    document.head.appendChild(script);
  });
}

export function KakaoShare({ event, share, venue }: KakaoShareProps) {
  const javascriptKey = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;

  if (!javascriptKey) {
    return null;
  }

  const handleShare = async () => {
    const kakao = await loadKakaoSdk();

    if (!kakao.isInitialized()) {
      kakao.init(javascriptKey);
    }

    kakao.Share.sendDefault({
      objectType: 'location',
      address: venue.address,
      addressTitle: `${venue.name} ${venue.hall}`,
      content: {
        title: share.title,
        description: share.description,
        imageUrl: share.imageUrl,
        link: {
          mobileWebUrl: share.pageUrl,
          webUrl: share.pageUrl,
        },
      },
      buttons: [
        {
          title: '청첩장 보기',
          link: {
            mobileWebUrl: share.pageUrl,
            webUrl: share.pageUrl,
          },
        },
        {
          title: '위치 보기',
          link: {
            mobileWebUrl: share.locationButtonUrl,
            webUrl: share.locationButtonUrl,
          },
        },
      ],
    });
  };

  return (
    <section className="kakao-share" aria-label="카카오톡 공유">
      <button className="kakao-share__button" type="button" onClick={handleShare}>
        <MessageCircleHeart size={18} aria-hidden="true" />
        <span>카카오톡 공유하기</span>
      </button>
      <p>
        {event.shortDate} · {venue.name}
      </p>
    </section>
  );
}

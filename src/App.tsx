import { Film } from './components/Film';
import { Gallery } from './components/Gallery';
import { Hero } from './components/Hero';
import { Invitation } from './components/Invitation';
import { KakaoShare } from './components/KakaoShare';
import { PhotoUploadTeaser } from './components/PhotoUploadTeaser';
import { Transportation } from './components/Transportation';
import { When } from './components/When';
import { Where } from './components/Where';
import { invitation } from './data/invitation';

function isShareRoute() {
  const searchParams = new URLSearchParams(window.location.search);
  const redirectPath = searchParams.get('redirect') || '';

  return window.location.pathname === '/share' || redirectPath.startsWith('/share');
}

function App() {
  if (isShareRoute()) {
    return (
      <main className="site-shell">
        <Hero
          couple={invitation.couple}
          event={invitation.event}
          hero={invitation.hero}
        />
        <PhotoUploadTeaser settings={invitation.photoUpload} />
      </main>
    );
  }

  return (
    <main className="site-shell">
      <Hero
        couple={invitation.couple}
        event={invitation.event}
        hero={invitation.hero}
      />
      <KakaoShare
        event={invitation.event}
        share={invitation.kakaoShare}
        venue={invitation.venue}
      />
      <Invitation messages={invitation.invitationMessage} />
      <When event={invitation.event} />
      <Where venue={invitation.venue} />
      <Transportation transportation={invitation.transportation} />
      <Film film={invitation.film} />
      <Gallery images={invitation.gallery} />
      <PhotoUploadTeaser settings={invitation.photoUpload} />
    </main>
  );
}

export default App;

import { Film } from './components/Film';
import { Gallery } from './components/Gallery';
import { Hero } from './components/Hero';
import { Invitation } from './components/Invitation';
import { PhotoUploadTeaser } from './components/PhotoUploadTeaser';
import { Transportation } from './components/Transportation';
import { When } from './components/When';
import { Where } from './components/Where';
import { invitation } from './data/invitation';

function App() {
  return (
    <main className="site-shell">
      <Hero
        couple={invitation.couple}
        event={invitation.event}
        hero={invitation.hero}
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

export default function HlaupPage() {
  return (
    <div style={{ margin: 0, padding: 0, fontFamily: '"Segoe UI", Roboto, Arial, sans-serif', background: '#f5f7fa', color: '#111', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #003F8A 0%, #0065CC 60%, #0080FF 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '80px 24px 64px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        {/* Organiser logos */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 32, marginBottom: 40, flexWrap: 'wrap' }}>
          <img src="/sponsors/image11.png" alt="HHHC" style={{ height: 80, filter: 'brightness(0) invert(1)', objectFit: 'contain' }} />
          <span style={{ fontSize: 28, opacity: 0.7 }}>&amp;</span>
          <img src="/sponsors/image13.jpeg" alt="Kraftur" style={{ height: 80, objectFit: 'contain', borderRadius: 8 }} />
        </div>

        <p style={{ margin: '0 0 12px', fontSize: 18, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.85, fontWeight: 600 }}>
          Líkamsræktarhlaup til góðs málefnis
        </p>
        <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 900, letterSpacing: -1, lineHeight: 1.1 }}>
          17. júní hlaup
        </h1>
        <p style={{ margin: '0 0 8px', fontSize: 22, opacity: 0.9, fontWeight: 500 }}>
          HHHC &amp; Krafts
        </p>
        <p style={{ margin: '0 0 40px', fontSize: 16, opacity: 0.75 }}>
          Þjóðhátíðardagurinn · 17. júní 2025
        </p>

        <a href="#verðlaun" style={{
          display: 'inline-block',
          background: 'white',
          color: '#003F8A',
          fontWeight: 800,
          fontSize: 16,
          padding: '14px 36px',
          borderRadius: 50,
          textDecoration: 'none',
          letterSpacing: 0.5,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          transition: 'transform 0.2s',
        }}>
          Skoða útdráttarverðlaun ↓
        </a>
      </section>

      {/* Info strip */}
      <section style={{
        background: '#E85400',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 0,
      }}>
        {[
          { icon: '📅', label: 'Dagsetning', value: '17. júní 2025' },
          { icon: '🏃', label: 'Tegund', value: 'Líkamsræktarhlaup' },
          { icon: '🎁', label: 'Útdráttur', value: 'Verðlaun eftir hlaup' },
          { icon: '❤️', label: 'Tilefni', value: 'Góðgerðarmál' },
        ].map((item) => (
          <div key={item.label} style={{ padding: '24px 32px', textAlign: 'center', minWidth: 160 }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{item.icon}</div>
            <div style={{ fontSize: 11, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{item.value}</div>
          </div>
        ))}
      </section>

      {/* About */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px 48px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16, color: '#003F8A' }}>Um hlaupiðn</h2>
        <p style={{ fontSize: 17, lineHeight: 1.8, color: '#444', margin: 0 }}>
          Við bjóðum alla velkomna í spennandi líkamsræktarhlaup á þjóðhátíðardeginum 17. júní.
          Hlaupiðn er skipulögð af <strong>HHHC</strong> og <strong>Krafti</strong> og tekjurnar renna til góðs málefnis.
          Þátttakendur fá tækifæri til að hlaufa, njóta dagsins og taka þátt í útdráttarverðlaunum
          með frábærum gjöfum frá styrktaraðilum okkar.
        </p>
      </section>

      {/* Prizes */}
      <section id="verðlaun" style={{ background: '#fff', padding: '64px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ color: '#E85400', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', fontSize: 13, marginBottom: 8 }}>Styrktaraðilar</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, margin: 0, color: '#111' }}>Útdráttarverðlaun 🎉</h2>
            <p style={{ color: '#666', marginTop: 12, fontSize: 15 }}>Eftirfarandi verðlaun verða dregin út meðal þátttakenda</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {[
              {
                logo: '/sponsors/image9.png',
                sponsor: 'Boss búðin',
                prize: '10 pör af Boss hlaupaglófum',
                qty: '10 verðlaun',
              },
              {
                logo: '/sponsors/image10.png',
                sponsor: 'Fætur Toga',
                prize: 'Gjafabréf í göngugreiningu',
                qty: '3 gjafabréf',
              },
              {
                logo: '/sponsors/image1.png',
                sponsor: 'Íslandsbanki',
                prize: 'Miðar í vegalengd að eiginvali í Reykjavíkurmaraþon Íslandsbanka',
                qty: '3 miðar',
              },
              {
                logo: '/sponsors/image4.png',
                sponsor: 'Optical Studio',
                prize: 'Gjafabréf',
                qty: '15.000 kr.',
              },
              {
                logo: '/sponsors/image2.png',
                sponsor: 'Garminbúðin',
                prize: 'Index Sleep mælir',
                qty: '1 mælir',
              },
              {
                logo: '/sponsors/image3.jpeg',
                sponsor: 'VAXA',
                prize: 'Grænmetiskörfur',
                qty: '10 körfur',
              },
              {
                logo: '/sponsors/image5.png',
                sponsor: 'Vecct',
                prize: 'Gjafabréf',
                qty: '20.000 kr.',
              },
              {
                logo: '/sponsors/image6.png',
                sponsor: 'Kringlan',
                prize: 'Gjafabréf',
                qty: '2 × 10.000 kr.',
              },
              {
                logo: '/sponsors/image14.jpeg',
                sponsor: 'Heilsa',
                prize: 'Gjafapokar',
                qty: '10 pokar',
              },
              {
                logo: '/sponsors/image7.png',
                sponsor: 'UltraForm',
                prize: '3ja mánaða passi',
                qty: '1 passi',
              },
              {
                logo: '/sponsors/image8.png',
                sponsor: 'Craftverslun',
                prize: 'Gjafabréf',
                qty: '3 × 15.000 kr.',
              },
            ].map((item) => (
              <div key={item.sponsor} style={{
                background: '#f8f9fb',
                border: '1px solid #e8eaed',
                borderRadius: 16,
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 16,
                transition: 'box-shadow 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <div style={{
                  background: 'white',
                  borderRadius: 12,
                  padding: '12px 16px',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 72,
                }}>
                  <img
                    src={item.logo}
                    alt={item.sponsor}
                    style={{ maxHeight: 56, maxWidth: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: '#111' }}>{item.prize}</div>
                  <div style={{
                    display: 'inline-block',
                    background: '#003F8A',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: 20,
                    letterSpacing: 0.3,
                  }}>{item.qty}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organiser section */}
      <section style={{ padding: '64px 24px', background: '#f5f7fa' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 40, color: '#111' }}>Skipuleggjendur</h2>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 48, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 12 }}>
                <img src="/sponsors/image11.png" alt="HHHC" style={{ height: 80, objectFit: 'contain' }} />
              </div>
              <p style={{ fontWeight: 700, color: '#003F8A', margin: 0 }}>HHHC</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 12 }}>
                <img src="/sponsors/image13.jpeg" alt="Kraftur" style={{ height: 80, objectFit: 'contain', borderRadius: 8 }} />
              </div>
              <p style={{ fontWeight: 700, color: '#E85400', margin: 0 }}>Kraftur</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 12 }}>
                <img src="/sponsors/image12.png" alt="Íþróttafélagið Hraði" style={{ height: 80, objectFit: 'contain' }} />
              </div>
              <p style={{ fontWeight: 700, color: '#003F8A', margin: 0 }}>Íþróttafélagið Hraði</p>
            </div>
          </div>
        </div>
      </section>

      {/* Nuun sponsor strip */}
      <section style={{ background: '#003F8A', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 20px' }}>Einnig með stuðningi frá</p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
          <img src="/sponsors/image15.png" alt="nuun" style={{ height: 48, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0a0a0a', color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '32px 24px', fontSize: 13 }}>
        <p style={{ margin: 0 }}>© 2025 HHHC &amp; Kraftur · 17. júní hlaup · Allar tekjur til góðs málefnis</p>
      </footer>
    </div>
  );
}

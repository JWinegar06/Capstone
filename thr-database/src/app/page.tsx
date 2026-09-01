import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="home-page">
      {/* =====================================================
          HERO
          ===================================================== */}
      <section className="home-hero">
        <div className="home-hero-image">
          <Image
            src="/images/EaB1977.jpg"
            alt="Historic mining structure Eagle and Blue Bell 1977"
            fill
            priority
            sizes="100vw"
            className="home-background-image"
          />

          <div className="home-hero-overlay" />

          <div className="home-hero-content">
            <div className="home-eyebrow">
              Utah Mining History • Digital Archive
            </div>

            <h1>Treasure House Relics Database</h1>

            <p className="home-hero-subtitle">
              Preserving the records, companies, certificates, people,
              photographs, and history of Utah&apos;s mining heritage.
            </p>

            <div className="home-hero-actions">
              <Link
                href="/dashboard"
                className="home-button home-button-primary"
              >
                Open Database
              </Link>

              <a href="#about" className="home-button home-button-secondary">
                Explore the Archive
              </a>
            </div>
          </div>

          <div className="home-photo-caption">
            Historic mining structure • Utah mining heritage collection
          </div>
        </div>
      </section>

      {/* =====================================================
          INTRODUCTION
          ===================================================== */}
      <section id="about" className="home-intro">
        <div className="home-section-inner">
          <div className="home-section-heading">
            <span className="home-section-kicker">
              Preserving Mining History
            </span>

            <h2>A Living Archive of Utah&apos;s Mining Heritage</h2>

            <div className="home-title-rule">
              <span />
              <span className="home-rule-diamond">◆</span>
              <span />
            </div>
          </div>

          <div className="home-intro-grid">
            <div className="home-intro-copy">
              <p className="home-lead">
                The Treasure House Relics Database brings historical mining
                information together into a searchable digital collection.
              </p>

              <p>
                Explore mining companies, certificates, historic records,
                photographs, and related materials while preserving the
                connections between individual pieces of Utah&apos;s mining
                history.
              </p>

              <p>
                The database combines the feel of a traditional historical
                archive with modern Form and Table views, making it easier to
                document, research, organize, and maintain the collection.
              </p>

              <Link href="/dashboard" className="home-text-link">
                Enter the research database
                <span aria-hidden="true"> →</span>
              </Link>
            </div>

            <aside className="home-archive-card">
              <div className="home-archive-card-header">Archive Collection</div>

              <div className="home-archive-card-body">
                <div className="home-archive-row">
                  <span className="home-archive-icon">◆</span>
                  <div>
                    <strong>Mining Companies</strong>
                    <span>
                      Historic companies, properties, districts, and operations.
                    </span>
                  </div>
                </div>

                <div className="home-archive-row">
                  <span className="home-archive-icon">◆</span>
                  <div>
                    <strong>Certificates</strong>
                    <span>
                      Stock certificates, documents, and associated records.
                    </span>
                  </div>
                </div>

                <div className="home-archive-row">
                  <span className="home-archive-icon">◆</span>
                  <div>
                    <strong>Historic Records</strong>
                    <span>
                      Names, dates, locations, notes, sources, and research.
                    </span>
                  </div>
                </div>

                <div className="home-archive-row">
                  <span className="home-archive-icon">◆</span>
                  <div>
                    <strong>Images &amp; Artifacts</strong>
                    <span>
                      Photographs and visual documentation connected to the
                      archive.
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURES
          ===================================================== */}
      <section className="home-features">
        <div className="home-section-inner">
          <div className="home-section-heading">
            <span className="home-section-kicker">
              Research • Organize • Preserve
            </span>

            <h2>Built for Historical Research</h2>
          </div>

          <div className="home-feature-grid">
            <article className="home-feature-card">
              <div className="home-feature-number">01</div>

              <h3>Search the Collection</h3>

              <p>
                Locate companies and records without searching through
                individual documents or disconnected spreadsheets.
              </p>
            </article>

            <article className="home-feature-card">
              <div className="home-feature-number">02</div>

              <h3>View Complete Records</h3>

              <p>
                Use a detailed Form View to examine the information attached to
                an individual historical record.
              </p>
            </article>

            <article className="home-feature-card">
              <div className="home-feature-number">03</div>

              <h3>Compare Records</h3>

              <p>
                Switch to Table View when you need to review multiple records
                together and compare their information.
              </p>
            </article>

            <article className="home-feature-card">
              <div className="home-feature-number">04</div>

              <h3>Preserve the Details</h3>

              <p>
                Maintain names, dates, descriptions, references, images, and
                research notes in one organized archive.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* =====================================================
          ARCHIVE QUOTE / VISUAL BREAK
          ===================================================== */}
      <section className="home-history-banner">
        <div className="home-history-banner-inner">
          <span className="home-history-mark">◆</span>

          <p>
            Every certificate, photograph, company name, and handwritten note is
            another piece of the story.
          </p>

          <span className="home-history-mark">◆</span>
        </div>
      </section>

      {/* =====================================================
          CTA
          ===================================================== */}
      <section className="home-cta">
        <div className="home-section-inner">
          <div className="home-cta-box">
            <div>
              <span className="home-section-kicker">Treasure House Relics</span>

              <h2>Continue to the Collection</h2>

              <p>
                Open the database to search, review, add, and maintain
                historical mining records.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="home-button home-button-primary home-cta-button"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
          ===================================================== */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          <div>
            <strong>Treasure House Relics Database</strong>
            <span>Utah Mining History Digital Archive</span>
          </div>

          <div className="home-footer-mark">◆</div>

          <p>
            Preserving yesterday&apos;s records for tomorrow&apos;s research.
          </p>
        </div>
      </footer>
    </main>
  );
}

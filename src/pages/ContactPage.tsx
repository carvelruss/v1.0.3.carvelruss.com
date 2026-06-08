import Contact from '../components/Contact';

export default function ContactPage() {
  return (
    <>
      <section className="ws-pg-hero">
        <div className="container">
          <p className="ws-eyebrow">Get in touch</p>
          <h1 className="section-title">Let's Work Together</h1>
          <p className="ws-pg-hero__sub">
            Have a project in mind or just want to say hello?
            Send me a message and I'll get back to you within 24–48 hours.
          </p>
        </div>
      </section>

      <section className="ws-section">
        <div className="container">
          <Contact />
        </div>
      </section>
    </>
  );
}

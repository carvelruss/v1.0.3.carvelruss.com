import Contact from '../components/Contact';

export default function ContactPage() {
  return (
    <>
      {/* Page hero — matches the light-hero pattern used across the site */}
      <div className="page-hero">
        <div className="container-site">
          <span className="page-hero__eyebrow">Get in touch</span>
          <h1 className="page-hero__heading">Let's Work Together</h1>
          <p className="page-hero__sub">
            Have a project in mind or just want to say hello?
            Send me a message and I'll get back to you within 24–48 hours.
          </p>
        </div>
      </div>

      {/* Contact form + info — existing component, unchanged */}
      <Contact />
    </>
  );
}

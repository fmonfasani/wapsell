import { LegalShell } from "./LegalShell";

// English version — same substance as PrivacyEs, translated and adapted to
// readers outside Argentina (drops the specific AAIP reference but keeps the
// equivalent GDPR rights).
export function PrivacyEn() {
  return (
    <LegalShell title="Privacy Policy" updated="Last updated: June 4, 2026">
      <p>
        This policy describes how <strong>Wapsell</strong> (&ldquo;we&rdquo; or
        &ldquo;the Service&rdquo;) collects, uses, and protects the personal
        information of people who use our website (wapsell.com) and the
        services we provide.
      </p>
      <p>
        By using Wapsell you accept the terms described here. If you do not
        agree, please stop using the Service.
      </p>

      <h2>1. Data controller</h2>
      <p>
        The controller of your personal data is <strong>Fulvio Monfasani</strong>,
        a sole proprietor registered in Argentina (CUIT available on request),
        based in Córdoba Province. You can reach us at{" "}
        <a href="mailto:contact@wapsell.com">contact@wapsell.com</a>.
      </p>

      <h2>2. Data we collect</h2>
      <h3>Data you provide</h3>
      <ul>
        <li>
          Name, email, and phone when you fill out a form or write to us via
          WhatsApp.
        </li>
        <li>
          Business details (industry, website, team) when you subscribe to the
          Service.
        </li>
        <li>
          Billing data (Tax ID, legal name, fiscal address) if you purchase a
          paid plan.
        </li>
      </ul>

      <h3>Data generated automatically</h3>
      <ul>
        <li>
          Usage logs: IP address, browser type, pages visited, date and time.
        </li>
        <li>
          Strictly necessary cookies (e.g., language preference) — no marketing
          cookies.
        </li>
        <li>Aggregated, anonymized product analytics.</li>
      </ul>

      <h3>Data about your end customers</h3>
      <p>
        When you contract Wapsell to answer your customers&apos; WhatsApp
        messages, we act as a <strong>data processor</strong> on your behalf.
        We process those conversations solely to deliver the Service to you.
        You remain the controller of that data and the party responsible for
        complying with your own legal obligations toward your customers.
      </p>

      <h2>3. How we use your data</h2>
      <ul>
        <li>Provide the Service you signed up for.</li>
        <li>Reach you about your account, support, and product updates.</li>
        <li>Bill you and comply with tax obligations.</li>
        <li>
          Improve the product through aggregated, anonymized analytics — never
          your individual messages without explicit consent.
        </li>
        <li>Comply with legal or judicial requirements when applicable.</li>
      </ul>

      <h2>4. Who we share data with</h2>
      <p>
        We do not sell your data. We share it only with vendors necessary to
        operate the Service, each bound by confidentiality agreements:
      </p>
      <ul>
        <li>
          <strong>Meta Platforms Ireland Ltd.</strong> (WhatsApp Business
          Platform) — required to send and receive messages.
        </li>
        <li>
          <strong>OpenRouter, Inc.</strong> and/or its upstream model providers
          (OpenAI, Anthropic, etc.) — to generate agent responses.
        </li>
        <li>
          <strong>Hetzner Online GmbH</strong> — infrastructure hosting.
        </li>
        <li>
          <strong>Stripe</strong> and/or <strong>Mercado Pago Argentina</strong> —
          payment processing.
        </li>
        <li>
          Public authorities when required by law, court order, or tax
          request.
        </li>
      </ul>

      <h2>5. International transfers</h2>
      <p>
        Some of the vendors above operate outside Argentina. In those cases we
        require appropriate contractual safeguards and only use vendors
        recognized by the Argentine data-protection authority or with
        equivalent international certifications.
      </p>

      <h2>6. Retention</h2>
      <ul>
        <li>
          <strong>Account data:</strong> while your Service is active, plus 5
          years for tax compliance.
        </li>
        <li>
          <strong>WhatsApp conversations processed on your behalf:</strong>{" "}
          while your subscription is active. You can request deletion or export
          at any time.
        </li>
        <li>
          <strong>Technical logs:</strong> up to 12 months, then auto-deleted.
        </li>
      </ul>

      <h2>7. Your rights</h2>
      <p>You can:</p>
      <ul>
        <li>Access the data we hold about you.</li>
        <li>Ask us to correct anything that&apos;s wrong.</li>
        <li>Ask us to delete it when no longer needed.</li>
        <li>Object to specific processing.</li>
        <li>
          Request portability of your data in a machine-readable standard
          format.
        </li>
      </ul>
      <p>
        To exercise any of these rights write to{" "}
        <a href="mailto:contact@wapsell.com">contact@wapsell.com</a>. We respond
        within 10 business days.
      </p>

      <h2>8. Security</h2>
      <p>
        We apply reasonable technical and organizational measures: HTTPS in
        transit, encryption at rest for sensitive tokens, role-based access
        control, daily backups. No system is 100% secure: if we detect a data
        breach that affects you, we will notify you within 72 hours and report
        to the competent authority when required.
      </p>

      <h2>9. Children</h2>
      <p>
        Wapsell is a B2B service. It is not directed at people under 18. If you
        are a minor, please do not share personal information with us.
      </p>

      <h2>10. Cookies</h2>
      <p>
        We use only strictly necessary cookies (language preference, session).
        No marketing or third-party profiling cookies without your consent. You
        can disable them in your browser, though that may affect site
        functionality.
      </p>

      <h2>11. Changes</h2>
      <p>
        If we modify this policy we&apos;ll post the new version here with the
        updated date. For material changes we&apos;ll notify you via email or
        WhatsApp before they take effect.
      </p>

      <h2>12. Contact</h2>
      <p>
        Any question about this policy, write to{" "}
        <a href="mailto:contact@wapsell.com">contact@wapsell.com</a>.
      </p>
    </LegalShell>
  );
}

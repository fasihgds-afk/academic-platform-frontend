import { BadgeCheck, MailCheck, PackageCheck } from "lucide-react";

const NEXT_STEPS = [
  {
    icon: BadgeCheck,
    title: "Payment confirmed",
    body: "Your transaction was processed securely and your order is marked as paid.",
  },
  {
    icon: MailCheck,
    title: "Confirmation by email",
    body: "A receipt and order updates will be sent to the email used at checkout.",
  },
  {
    icon: PackageCheck,
    title: "Delivery comes next",
    body: "Your assignment will be prepared and delivered by email when it is ready.",
  },
];

export default function PaymentSuccessPage() {
  return (
    <div className="pay-success-page">
      <div className="pay-success-shell">
        <main className="pay-success-card">
          <div className="pay-success-mark" aria-hidden="true">
            <span className="pay-success-glow" />
            <span className="pay-success-ring pay-success-ring-a" />
            <span className="pay-success-ring pay-success-ring-b" />
            <span className="pay-success-check">
              <svg
                className="pay-success-svg"
                viewBox="0 0 48 48"
                fill="none"
              >
                <path
                  className="pay-success-tick"
                  d="M13 24.5 20.2 31.8 35.5 15.8"
                />
              </svg>
            </span>
          </div>

          <p className="pay-success-badge">
            <BadgeCheck size={14} strokeWidth={2} />
            Payment confirmed
          </p>
          <h1>Thank you. You’re all set.</h1>
          <p className="pay-success-lead">
            Your payment was successful. You can close this window. We’ll take
            it from here and keep you updated by email.
          </p>

          <ol className="pay-success-steps">
            {NEXT_STEPS.map(({ icon: Icon, title, body }) => (
              <li key={title}>
                <span className="pay-success-step-icon" aria-hidden="true">
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <p>{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </main>

        <p className="pay-success-foot">
          Need help? Reply to your order confirmation email and our team will
          assist you.
        </p>
      </div>
    </div>
  );
}

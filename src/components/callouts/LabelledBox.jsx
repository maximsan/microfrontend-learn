/** A box with a small label on top: the frame shared by callouts, recaps and self-checks. */
export const LabelledBox = ({ className, label, children }) => (
  <div className={className}>
    <span className="tag">{label}</span>
    {children}
  </div>
);

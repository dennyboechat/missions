export interface SideMenuLayoutProps {
  menuItems: React.ReactNode;
  /**
   * Context above the menu. Pass it as "" rather than omitting it while the
   * name is still loading: the block is only reserved when the prop is present,
   * so leaving it out entirely would let the menu jump once the name arrives.
   */
  header?: string;
  subHeader?: string;
  subHeaderFooter?: string;
  /**
   * Anything that belongs with the context rather than under the menu — the
   * patient's QR code, for instance. Only pass content that is available on the
   * first paint: the block it sits in is measured from this prop's presence, not
   * from what it renders (see SideMenuLayout).
   */
  headerExtra?: React.ReactNode;
  isBoldHeader?: boolean;
  /** The same context, held at the bottom of the panel instead of the top. */
  footer?: string;
  children: React.ReactNode;
}

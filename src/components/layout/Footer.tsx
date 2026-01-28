import { Link } from 'react-router-dom';
import evntgoLogo from '@/assets/evntgo-logo.jpeg';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <img src={evntgoLogo} alt="EvntGo" className="h-12 w-auto rounded-lg mb-4" />
            <p className="text-sm text-primary-foreground/70">
              Where students connect to opportunity.
            </p>
          </div>

          {/* For Students */}
          <div>
            <h4 className="font-semibold mb-4">For Students</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/events" className="hover:text-primary-foreground transition-colors">Browse Events</Link></li>
              <li><Link to="/hackathons" className="hover:text-primary-foreground transition-colors">Hackathons</Link></li>
              <li><Link to="/jobs" className="hover:text-primary-foreground transition-colors">Jobs</Link></li>
              <li><Link to="/internships" className="hover:text-primary-foreground transition-colors">Internships</Link></li>
            </ul>
          </div>

          {/* For Organizations */}
          <div>
            <h4 className="font-semibold mb-4">For Organizations</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/signup?role=college" className="hover:text-primary-foreground transition-colors">Register College</Link></li>
              <li><Link to="/signup?role=company" className="hover:text-primary-foreground transition-colors">Register Company</Link></li>
              <li><Link to="/pricing" className="hover:text-primary-foreground transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/about" className="hover:text-primary-foreground transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary-foreground transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
          <p>© {new Date().getFullYear()} EvntGo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

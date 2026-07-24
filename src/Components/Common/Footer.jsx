const Footer = () => {
  return (
    <footer className="bg-[#05050f] border-t border-white/10">

      <div className="max-w-7xl mx-auto px-6 py-14">

        <div className="grid md:grid-cols-4 gap-10">

          <div>

            <h2 className="text-2xl font-bold text-white">
              Brand
              <span className="text-violet-500">Verse</span>
            </h2>

            <p className="text-gray-400 mt-4 leading-7">
              Connecting brands with creators through
              meaningful collaborations.
            </p>

          </div>

          <div>

            <h3 className="text-white font-semibold mb-4">
              Company
            </h3>

            <ul className="space-y-3 text-gray-400">

              <li>About</li>
              <li>Careers</li>
              <li>Blog</li>

            </ul>

          </div>

          <div>

            <h3 className="text-white font-semibold mb-4">
              Resources
            </h3>

            <ul className="space-y-3 text-gray-400">

              <li>Help Center</li>
              <li>Privacy</li>
              <li>Terms</li>

            </ul>

          </div>

          <div>

            <h3 className="text-white font-semibold mb-4">
              Contact
            </h3>

            <p className="text-gray-400">
              hello@brandverse.com
            </p>

          </div>

        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-gray-500">

          © 2026 BrandVerse. All rights reserved.

        </div>

      </div>

    </footer>
  );
};

export default Footer;